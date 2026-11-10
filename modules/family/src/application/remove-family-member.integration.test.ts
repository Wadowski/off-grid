// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { listMyFamilies } from "../application/list-my-families.js";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
import { addFamilyMember } from "../../test/add-family-member.js";
import { createFamily } from "./create-family.js";
import { getFamily } from "./get-family.js";
import { removeFamilyMember } from "./remove-family-member.js";

describe("removeFamilyMember", { timeout: 60_000 }, () => {
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

  it("lets an admin remove a member, who then loses access to the family", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const outcome = await removeFamilyMember(db.db, admin, family.id, member);

    expect(outcome).toMatchObject({ outcome: "found", value: { userId: member } });
    expect(await getFamily(db.db, member, family.id)).toEqual({ outcome: "not-found" });
    expect(await listMyFamilies(db.db, member)).toEqual([]);
    const { rows } = await db.admin.query(
      "SELECT count(*)::int AS n FROM outbox.event WHERE type = 'family-member-removed-v1' AND family_id = $1",
      [family.id],
    );
    expect(rows[0]).toEqual({ n: 1 });
  });

  it("lets a member leave the family, and then they no longer see it", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const outcome = await removeFamilyMember(db.db, member, family.id, member);

    expect(outcome).toMatchObject({ outcome: "found", value: { userId: member } });
    expect(await listMyFamilies(db.db, member)).toEqual([]);
    expect(await getFamily(db.db, admin, family.id)).toMatchObject({ outcome: "found" });
  });

  it("refuses the only admin leaving the family", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");

    expect(await removeFamilyMember(db.db, admin, family.id, admin)).toEqual({
      outcome: "last-admin",
    });
    expect(await getFamily(db.db, admin, family.id)).toMatchObject({ outcome: "found" });
  });

  it("refuses a member, who cannot remove anyone", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    expect(await removeFamilyMember(db.db, member, family.id, admin)).toEqual({
      outcome: "forbidden",
    });
    expect(await getFamily(db.db, admin, family.id)).toMatchObject({ outcome: "found" });
  });

  it("refuses to remove the only admin", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");

    expect(await removeFamilyMember(db.db, admin, family.id, admin)).toEqual({
      outcome: "last-admin",
    });
    expect(await getFamily(db.db, admin, family.id)).toMatchObject({ outcome: "found" });
  });

  it("reports a target who is not a member as not found", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");

    expect(await removeFamilyMember(db.db, admin, family.id, randomUUID())).toEqual({
      outcome: "not-found",
    });
  });
});
