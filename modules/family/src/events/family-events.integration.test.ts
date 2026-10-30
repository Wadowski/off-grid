// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withFamilyContext } from "@offgrid/db";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
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
      db.db.$transaction(async (tx) => {
        await withFamilyContext(tx, familyId);
        await tx.family.create({ data: { familyId, name: "Rolled back" } });
        await publishFamilyCreated(tx, {
          familyId,
          name: "Rolled back",
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

    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      await tx.family.create({ data: { familyId, name: "Committed" } });
      await publishFamilyCreated(tx, { familyId, name: "Committed" });
    });

    const { rows } = await db.admin.query(
      "SELECT count(*)::int AS n FROM outbox.event WHERE family_id = $1",
      [familyId],
    );
    expect(rows[0]).toEqual({ n: 1 });
  });
});
