// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withFamilyContext, withUserContext } from "@offgrid/db";
import { startFamilyTestDatabase } from "../../test/start-family-test-database.js";
import type { FamilyTestDatabase } from "../../test/types.js";

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

  it("changes and deletes no rows of another family", async () => {
    const familyA = randomUUID();
    const familyB = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyA);
      await tx.family.create({ data: { familyId: familyA, name: "A" } });
    });

    const result = await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyB);
      return {
        updated: await tx.family.updateMany({ where: { familyId: familyA }, data: { name: "x" } }),
        deleted: await tx.family.deleteMany({ where: { familyId: familyA } }),
      };
    });
    const names = await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyA);
      return tx.family.findMany({ select: { name: true } });
    });

    expect(result.updated.count).toBe(0);
    expect(result.deleted.count).toBe(0);
    expect(names).toEqual([{ name: "A" }]);
  });

  it("shows an invitation only to an admin of the family that issued it", async () => {
    const familyA = randomUUID();
    const familyB = randomUUID();
    const adminA = randomUUID();
    const adminB = randomUUID();
    await db.admin.query(
      "INSERT INTO family.family (family_id, name) VALUES ($1, 'A'), ($2, 'B')",
      [familyA, familyB],
    );
    await db.admin.query(
      "INSERT INTO family.family_member (family_id, user_id, role) VALUES ($1, $2, 'admin'), ($3, $4, 'admin')",
      [familyA, adminA, familyB, adminB],
    );
    await db.admin.query(
      `INSERT INTO family.invitation (invitation_id, family_id, code_hash, created_by, expires_at)
       VALUES ($1, $2, $3, $4, now() + interval '7 days')`,
      [randomUUID(), familyA, "a".repeat(64), adminA],
    );

    const seenByOtherFamilyAdmin = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, adminB);
      return tx.familyInvitation.findMany();
    });
    const deletedByOtherFamilyAdmin = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, adminB);
      return tx.familyInvitation.deleteMany({ where: { familyId: familyA } });
    });
    const seenByIssuingAdmin = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, adminA);
      return tx.familyInvitation.findMany();
    });

    expect(seenByOtherFamilyAdmin).toEqual([]);
    expect(deletedByOtherFamilyAdmin.count).toBe(0);
    expect(seenByIssuingAdmin).toHaveLength(1);
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
