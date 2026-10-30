// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFamilyTestDatabase } from "../../test/start-family-test-database.js";
import type { FamilyTestDatabase } from "../../test/types.js";
import { setFamilyContext } from "../infrastructure/set-family-context.js";
import { withFamilyTransaction } from "../infrastructure/with-family-transaction.js";
import { publishFamilyCreated } from "./publish-family-created.js";

describe("family events", () => {
  let db: FamilyTestDatabase;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
  });

  it("drops the outbox event when the change rolls back", async () => {
    const familyId = randomUUID();

    await expect(
      withFamilyTransaction(db.pool, async (client) => {
        await setFamilyContext(client, familyId);
        await client.query(
          "INSERT INTO family.family (family_id, name) VALUES ($1, 'Rolled back')",
          [familyId],
        );
        await publishFamilyCreated(client, {
          familyId,
          name: "Rolled back",
          creatorUserId: randomUUID(),
        });
        throw new Error("change failed");
      }),
    ).rejects.toThrow("change failed");

    const { rows } = await db.admin.query(
      "SELECT count(*)::int AS n FROM outbox.event WHERE family_id = $1",
      [familyId],
    );
    expect(rows[0]).toEqual({ n: 0 });
  });

  it("keeps the outbox event when the change commits", async () => {
    const familyId = randomUUID();

    await withFamilyTransaction(db.pool, async (client) => {
      await setFamilyContext(client, familyId);
      await client.query("INSERT INTO family.family (family_id, name) VALUES ($1, 'Committed')", [
        familyId,
      ]);
      await publishFamilyCreated(client, {
        familyId,
        name: "Committed",
        creatorUserId: randomUUID(),
      });
    });

    const { rows } = await db.admin.query(
      "SELECT count(*)::int AS n FROM outbox.event WHERE family_id = $1",
      [familyId],
    );
    expect(rows[0]).toEqual({ n: 1 });
  });
});
