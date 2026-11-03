// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withFamilyContext, withUserContext } from "@offgrid/db";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";

describe("family schema isolation", { timeout: 60_000 }, () => {
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

  it("shows a family row only inside its own family context", async () => {
    const familyA = randomUUID();
    const familyB = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyA);
      await tx.family.create({ data: { familyId: familyA, name: "A" } });
    });

    const visibleToB = await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyB);
      return tx.family.findMany();
    });
    const visibleToA = await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyA);
      return tx.family.findMany();
    });

    expect(visibleToB).toEqual([]);
    expect(visibleToA).toHaveLength(1);
  });

  it("shows no rows when no family context is set", async () => {
    const familyId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      await tx.family.create({ data: { familyId, name: "Kitchen" } });
    });

    const rows = await db.db.$transaction((tx) => tx.family.findMany());

    expect(rows).toEqual([]);
  });

  it("refuses a membership row that names another family", async () => {
    const familyId = randomUUID();
    const otherFamilyId = randomUUID();

    await expect(
      db.db.$transaction(async (tx) => {
        await withFamilyContext(tx, familyId);
        await tx.family.create({ data: { familyId, name: "Kitchen" } });
        await tx.familyMember.create({ data: { familyId: otherFamilyId, userId: randomUUID() } });
      }),
    ).rejects.toThrow(/row-level security/);
  });

  it("shows a user only the memberships that name them", async () => {
    const familyId = randomUUID();
    const owner = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      await tx.family.create({ data: { familyId, name: "Kitchen" } });
      await tx.familyMember.create({ data: { familyId, userId: owner } });
    });

    const seenByOther = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, randomUUID());
      return tx.familyMember.findMany();
    });
    const seenByOwner = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, owner);
      return tx.familyMember.findMany();
    });

    expect(seenByOther).toEqual([]);
    expect(seenByOwner.map((member) => member.userId)).toEqual([owner]);
  });

  it("refuses the module role access to another module's schema", async () => {
    await expect(
      db.db.$transaction((tx) => tx.$queryRawUnsafe("SELECT 1 FROM outbox.event")),
    ).rejects.toThrow(/permission denied/);
  });
});
