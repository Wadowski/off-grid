// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { Context, TestDatabase } from "../test/types.js";
import { createModuleDb, withFamilyContext, withUserContext } from "./index.js";

const queryAs = async (client: Client, context: Context, sql: string, params: unknown[] = []) => {
  await client.query("BEGIN");
  try {
    if (context.familyId) {
      await client.query("SELECT set_config('app.family_id', $1, true)", [context.familyId]);
    }
    if (context.userId) {
      await client.query("SELECT set_config('app.user_id', $1, true)", [context.userId]);
    }
    const { rows } = await client.query(sql, params);
    await client.query("COMMIT");
    return rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

describe("row level isolation and the shared runtime role", () => {
  let db: TestDatabase;

  const familyA = randomUUID();
  const familyB = randomUUID();
  const userOne = randomUUID();
  const userTwo = randomUUID();

  beforeAll(async () => {
    db = await startTestDatabase();
    await db.admin.query(
      "INSERT INTO family.family (family_id, name) VALUES ($1, 'A'), ($2, 'B')",
      [familyA, familyB],
    );
    await db.admin.query(
      "INSERT INTO family.family_member (family_id, user_id) VALUES ($1, $2), ($3, $4)",
      [familyA, userOne, familyB, userTwo],
    );
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  describe("family scope", () => {
    it("shows only the family rows in context", async () => {
      const client = await db.connectClient();
      try {
        const rows = await queryAs(client, { familyId: familyA }, "SELECT name FROM family.family");
        expect(rows).toEqual([{ name: "A" }]);
      } finally {
        await client.end();
      }
    });

    it("shows nothing when no family is in context", async () => {
      const client = await db.connectClient();
      try {
        const rows = await queryAs(client, {}, "SELECT name FROM family.family");
        expect(rows).toEqual([]);
      } finally {
        await client.end();
      }
    });

    it("refuses to insert a membership row for another family", async () => {
      const client = await db.connectClient();
      try {
        await expect(
          queryAs(
            client,
            { familyId: familyA },
            "INSERT INTO family.family_member (family_id, user_id) VALUES ($1, $2)",
            [familyB, randomUUID()],
          ),
        ).rejects.toThrow(/row-level security/);
      } finally {
        await client.end();
      }
    });
  });

  describe("user memberships", () => {
    it("shows a user only the memberships that name them", async () => {
      const client = await db.connectClient();
      try {
        const rows = await queryAs(
          client,
          { userId: userOne },
          "SELECT family_id FROM family.family_member",
        );
        expect(rows).toEqual([{ family_id: familyA }]);
      } finally {
        await client.end();
      }
    });

    it("shows a user the families they belong to and no others", async () => {
      const client = await db.connectClient();
      try {
        const rows = await queryAs(client, { userId: userTwo }, "SELECT name FROM family.family");
        expect(rows).toEqual([{ name: "B" }]);
      } finally {
        await client.end();
      }
    });
  });

  describe("shared runtime role", () => {
    it("refuses direct writes to a shared table", async () => {
      const client = await db.connectClient();
      try {
        await expect(
          queryAs(
            client,
            {},
            "INSERT INTO outbox.subscriber_cursor (subscriber, last_sequence) VALUES ('x', 1)",
          ),
        ).rejects.toThrow(/permission denied/);
      } finally {
        await client.end();
      }
    });

    it("refuses direct reads of the event log, which the bus reads through functions", async () => {
      const client = await db.connectClient();
      try {
        await expect(queryAs(client, {}, "SELECT id FROM outbox.event")).rejects.toThrow(
          /permission denied/,
        );
      } finally {
        await client.end();
      }
    });
  });

  describe("Prisma client with the request context helpers", () => {
    it("reads only the context family through the module client", async () => {
      const prisma = createModuleDb(db.connectPool());
      try {
        const names = await prisma.$transaction(async (tx) => {
          await withFamilyContext(tx, familyB);
          return tx.$queryRawUnsafe<{ name: string }[]>("SELECT name FROM family.family");
        });
        expect(names).toEqual([{ name: "B" }]);
      } finally {
        await prisma.$disconnect();
      }
    });

    it("sets the user context for the transaction only", async () => {
      const prisma = createModuleDb(db.connectPool());
      try {
        const inside = await prisma.$transaction(async (tx) => {
          await withUserContext(tx, userOne);
          return tx.$queryRawUnsafe<{ family_id: string }[]>(
            "SELECT family_id FROM family.family_member",
          );
        });
        expect(inside).toEqual([{ family_id: familyA }]);

        const outside = await prisma.$queryRawUnsafe("SELECT family_id FROM family.family_member");
        expect(outside).toEqual([]);
      } finally {
        await prisma.$disconnect();
      }
    });
  });
});
