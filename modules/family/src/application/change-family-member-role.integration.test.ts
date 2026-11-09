// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
import { addFamilyMember } from "../../test/add-family-member.js";
import { createFamily } from "./create-family.js";
import { changeFamilyMemberRole } from "./change-family-member-role.js";
import { listFamilyMembers } from "./list-family-members.js";

describe("changeFamilyMemberRole", { timeout: 60_000 }, () => {
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

  it("lets an admin make a member an admin and publishes the change", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const outcome = await changeFamilyMemberRole(db.db, admin, family.id, member, "admin");

    expect(outcome).toMatchObject({ outcome: "found", value: { userId: member, role: "admin" } });
    const { rows } = await db.admin.query(
      "SELECT count(*)::int AS n FROM outbox.event WHERE type = 'family-member-updated-v1' AND family_id = $1",
      [family.id],
    );
    expect(rows[0]).toEqual({ n: 1 });
  });

  it("refuses a member, who cannot change roles", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    expect(await changeFamilyMemberRole(db.db, member, family.id, admin, "member")).toEqual({
      outcome: "forbidden",
    });
    expect(await listFamilyMembers(db.db, admin, family.id)).toMatchObject({
      outcome: "found",
      value: {
        members: expect.arrayContaining([
          expect.objectContaining({ userId: admin, role: "admin" }),
        ]),
      },
    });
  });

  it("reports a change by a user outside the family as not found", async () => {
    const family = await createFamily(db.db, randomUUID(), "Novak family");

    expect(
      await changeFamilyMemberRole(db.db, randomUUID(), family.id, randomUUID(), "admin"),
    ).toEqual({
      outcome: "not-found",
    });
  });

  it("reports a target who is not a member as not found", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");

    expect(await changeFamilyMemberRole(db.db, admin, family.id, randomUUID(), "admin")).toEqual({
      outcome: "not-found",
    });
  });

  it("refuses to demote the only admin", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");

    expect(await changeFamilyMemberRole(db.db, admin, family.id, admin, "member")).toEqual({
      outcome: "last-admin",
    });
  });

  it("allows an admin to be demoted while another admin remains", async () => {
    const admin = randomUUID();
    const other = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, other, "admin");

    expect(await changeFamilyMemberRole(db.db, admin, family.id, other, "member")).toMatchObject({
      outcome: "found",
      value: { userId: other, role: "member" },
    });
  });

  it("keeps one admin when two admins demote each other at the same time", async () => {
    const first = randomUUID();
    const second = randomUUID();
    const family = await createFamily(db.db, first, "Novak family");
    await addFamilyMember(db.db, family.id, second, "admin");

    const outcomes = await Promise.all([
      changeFamilyMemberRole(db.db, first, family.id, second, "member"),
      changeFamilyMemberRole(db.db, second, family.id, first, "member"),
    ]);

    expect(outcomes.filter((outcome) => outcome.outcome === "found")).toHaveLength(1);
    const remaining = await listFamilyMembers(db.db, first, family.id);
    expect(remaining).toMatchObject({ outcome: "found" });
    if (remaining.outcome === "found") {
      expect(remaining.value.members.filter((entry) => entry.role === "admin")).toHaveLength(1);
    }
  });
});
