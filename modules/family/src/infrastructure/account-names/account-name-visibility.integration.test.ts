// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withUserContext } from "@offgrid/db";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../../test/start-family-test-database.js";
import { addFamilyMember } from "../../../test/add-family-member.js";
import { applyAccountName } from "../../events/account-names/apply-account-name.js";
import { createFamily } from "../../application/create-family.js";

describe("account name visibility", { timeout: 60_000 }, () => {
  let db: FamilyTestDatabase;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  const storeName = async (userId: string, displayName: string) => {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      await applyAccountName(client, { userId, displayName, sourceVersion: 1 });
      await client.query("COMMIT");
    } finally {
      client.release();
    }
  };

  const readableNamesFor = (viewer: string, userIds: string[]) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, viewer);
      const rows = await tx.familyAccountName.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true },
      });
      return rows.map((row) => row.userId);
    });

  it("lets a person read the name of someone who shares a family with them", async () => {
    const owner = randomUUID();
    const colleague = randomUUID();
    const family = await createFamily(db.db, colleague, "Novak family");
    await addFamilyMember(db.db, family.id, owner, "member");
    await storeName(owner, "Sam Smith");

    expect(await readableNamesFor(colleague, [owner])).toEqual([owner]);
  });

  it("hides the name of someone who shares no family with the viewer", async () => {
    const owner = randomUUID();
    const stranger = randomUUID();
    await createFamily(db.db, owner, "Novak family");
    await createFamily(db.db, stranger, "Other family");
    await storeName(owner, "Sam Smith");

    expect(await readableNamesFor(stranger, [owner])).toEqual([]);
  });

  it("always lets a person read their own name", async () => {
    const owner = randomUUID();
    await storeName(owner, "Sam Smith");

    expect(await readableNamesFor(owner, [owner])).toEqual([owner]);
  });

  it("does not let a person write the name of another person", async () => {
    const owner = randomUUID();
    const intruder = randomUUID();

    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, intruder);
        await tx.familyAccountName.create({
          data: { userId: owner, displayName: "Forged", sourceVersion: 1 },
        });
      }),
    ).rejects.toThrow();
  });
});
