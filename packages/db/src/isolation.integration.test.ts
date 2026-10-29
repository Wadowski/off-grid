// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase, fixtureSources, type TestDatabase } from "../test/postgres.js";
import { createModuleDb, runMigrations, withFamilyContext, withUserContext } from "./index.js";

interface Context {
  familyId?: string;
  userId?: string;
}

/** Runs one query inside a transaction that sets the request context, as the runtime does. */
async function queryAs(client: Client, context: Context, sql: string, params: unknown[] = []) {
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
}

describe("row level isolation and role boundaries", () => {
  let db: TestDatabase;

  const familyA = randomUUID();
  const familyB = randomUUID();
  const userOne = randomUUID();
  const userTwo = randomUUID();

  beforeAll(async () => {
    db = await startTestDatabase();
    await runMigrations(db.migrator, fixtureSources());

    // Seeded as the superuser, which bypasses RLS, so the test controls the data.
    await db.admin.query(
      `INSERT INTO family.family_setting (id, family_id, label) VALUES
         ($1, $2, 'A setting'), ($3, $4, 'B setting')`,
      [randomUUID(), familyA, randomUUID(), familyB],
    );
    await db.admin.query(
      `INSERT INTO lists.list (id, family_id, user_id, title) VALUES
         ($1, $2, NULL, 'A shared list'),
         ($3, NULL, $4, 'U1 private list'),
         ($5, NULL, $6, 'U2 private list'),
         ($7, $8, NULL, 'B shared list')`,
      [randomUUID(), familyA, randomUUID(), userOne, randomUUID(), userTwo, randomUUID(), familyB],
    );
    await db.admin.query("INSERT INTO food.ingredient (id, name) VALUES ($1, 'flour')", [
      randomUUID(),
    ]);
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  describe("family scope", () => {
    it("shows only the rows of the family in context", async () => {
      const client = await db.connect("family");
      try {
        const rows = await queryAs(
          client,
          { familyId: familyA },
          "SELECT label FROM family.family_setting",
        );
        expect(rows).toEqual([{ label: "A setting" }]);
      } finally {
        await client.end();
      }
    });

    it("shows nothing when no family is in context", async () => {
      const client = await db.connect("family");
      try {
        const rows = await queryAs(client, {}, "SELECT label FROM family.family_setting");
        expect(rows).toEqual([]);
      } finally {
        await client.end();
      }
    });

    it("refuses to insert a row for another family", async () => {
      const client = await db.connect("family");
      try {
        await expect(
          queryAs(
            client,
            { familyId: familyA },
            "INSERT INTO family.family_setting (id, family_id, label) VALUES ($1, $2, 'intruder')",
            [randomUUID(), familyB],
          ),
        ).rejects.toThrow(/row-level security/);
      } finally {
        await client.end();
      }
    });
  });

  describe("family-or-user scope", () => {
    it("shows the family's shared rows and the user's own private rows only", async () => {
      const client = await db.connect("lists");
      try {
        const rows = await queryAs(
          client,
          { familyId: familyA, userId: userOne },
          "SELECT title FROM lists.list ORDER BY title",
        );
        expect(rows).toEqual([{ title: "A shared list" }, { title: "U1 private list" }]);
      } finally {
        await client.end();
      }
    });

    it("hides another member's private rows even inside the same family", async () => {
      const client = await db.connect("lists");
      try {
        const rows = await queryAs(
          client,
          { familyId: familyA, userId: userTwo },
          "SELECT title FROM lists.list WHERE title LIKE 'U1%'",
        );
        expect(rows).toEqual([]);
      } finally {
        await client.end();
      }
    });

    it("rejects a row with both an owner family and an owner user", async () => {
      const client = await db.connect("lists");
      try {
        await expect(
          queryAs(
            client,
            { familyId: familyA, userId: userOne },
            "INSERT INTO lists.list (id, family_id, user_id, title) VALUES ($1, $2, $3, 'both')",
            [randomUUID(), familyA, userOne],
          ),
        ).rejects.toThrow(/lists_one_owner|check constraint/);
      } finally {
        await client.end();
      }
    });
  });

  describe("module role boundaries", () => {
    it("refuses the family runtime role any access to the access schema", async () => {
      const client = await db.connect("family");
      try {
        await expect(
          queryAs(client, { familyId: familyA }, "SELECT id FROM access.access_grant"),
        ).rejects.toThrow(/permission denied for schema access/);
      } finally {
        await client.end();
      }
    });

    it("gives shared reference data read-only access to the app role", async () => {
      const client = await db.connect("food");
      try {
        const rows = await queryAs(client, {}, "SELECT name FROM food.ingredient");
        expect(rows).toEqual([{ name: "flour" }]);
        await expect(
          queryAs(client, {}, "INSERT INTO food.ingredient (id, name) VALUES ($1, 'sugar')", [
            randomUUID(),
          ]),
        ).rejects.toThrow(/permission denied/);
      } finally {
        await client.end();
      }
    });
  });

  describe("Prisma client with the request context helpers", () => {
    it("reads only the context family through the module client", async () => {
      const prisma = createModuleDb(db.target, "family");
      try {
        const labels = await prisma.$transaction(async (tx) => {
          await withFamilyContext(tx, familyB);
          return tx.$queryRawUnsafe<{ label: string }[]>("SELECT label FROM family.family_setting");
        });
        expect(labels).toEqual([{ label: "B setting" }]);
      } finally {
        await prisma.$disconnect();
      }
    });

    it("sets the user context for the transaction only", async () => {
      const prisma = createModuleDb(db.target, "lists");
      try {
        const inside = await prisma.$transaction(async (tx) => {
          await withUserContext(tx, userTwo);
          return tx.$queryRawUnsafe<{ title: string }[]>(
            "SELECT title FROM lists.list WHERE title LIKE 'U2%'",
          );
        });
        expect(inside).toEqual([{ title: "U2 private list" }]);

        const outside = await prisma.$queryRawUnsafe<{ title: string }[]>(
          "SELECT title FROM lists.list WHERE title LIKE 'U2%'",
        );
        expect(outside).toEqual([]);
      } finally {
        await prisma.$disconnect();
      }
    });
  });
});
