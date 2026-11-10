// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../../test/start-family-test-database.js";
import { addFamilyMember } from "../../../test/add-family-member.js";
import { createFamily } from "../create-family.js";
import { findActiveFamilyForSession } from "./find-active-family-for-session.js";
import { selectActiveFamily } from "./select-active-family.js";

describe("selectActiveFamily", { timeout: 60_000 }, () => {
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

  it("records the family as the choice for the session when the user is a member", async () => {
    const anna = randomUUID();
    const session = randomUUID();
    const cabin = await createFamily(db.db, anna, "Cabin Circle");

    const outcome = await selectActiveFamily(db.db, anna, session, cabin.id);

    expect(outcome).toEqual({ outcome: "found", value: { familyId: cabin.id } });
    expect(await findActiveFamilyForSession(db.db, anna, session)).toBe(cabin.id);
  });

  it("refuses a family the user is not a member of, and records nothing", async () => {
    const anna = randomUUID();
    const session = randomUUID();
    const ben = randomUUID();
    const bensFamily = await createFamily(db.db, ben, "Cabin Circle");

    const outcome = await selectActiveFamily(db.db, anna, session, bensFamily.id);

    expect(outcome).toEqual({ outcome: "not-found" });
    expect(await findActiveFamilyForSession(db.db, anna, session)).toBeNull();
  });

  it("replaces the earlier choice made in the same session", async () => {
    const anna = randomUUID();
    const session = randomUUID();
    const kowalski = await createFamily(db.db, anna, "Kowalski");
    const cabin = await createFamily(db.db, anna, "Cabin Circle");
    await selectActiveFamily(db.db, anna, session, kowalski.id);

    await selectActiveFamily(db.db, anna, session, cabin.id);

    expect(await findActiveFamilyForSession(db.db, anna, session)).toBe(cabin.id);
  });

  it("keeps a separate choice for each session of the same user", async () => {
    const anna = randomUUID();
    const laptop = randomUUID();
    const phone = randomUUID();
    const kowalski = await createFamily(db.db, anna, "Kowalski");
    const cabin = await createFamily(db.db, anna, "Cabin Circle");
    await selectActiveFamily(db.db, anna, laptop, kowalski.id);
    await selectActiveFamily(db.db, anna, phone, cabin.id);

    expect(await findActiveFamilyForSession(db.db, anna, laptop)).toBe(kowalski.id);
    expect(await findActiveFamilyForSession(db.db, anna, phone)).toBe(cabin.id);
  });

  it("does not let another user see or use someone else's choice", async () => {
    const anna = randomUUID();
    const ben = randomUUID();
    const session = randomUUID();
    const cabin = await createFamily(db.db, anna, "Cabin Circle");
    await addFamilyMember(db.db, cabin.id, ben, "member");
    await selectActiveFamily(db.db, anna, session, cabin.id);

    expect(await findActiveFamilyForSession(db.db, ben, session)).toBeNull();
  });

  it("forgets the choice once the user is removed from that family", async () => {
    const anna = randomUUID();
    const ben = randomUUID();
    const session = randomUUID();
    const cabin = await createFamily(db.db, ben, "Cabin Circle");
    await addFamilyMember(db.db, cabin.id, anna, "member");
    await selectActiveFamily(db.db, anna, session, cabin.id);

    await db.admin.query("DELETE FROM family.family_member WHERE family_id = $1 AND user_id = $2", [
      cabin.id,
      anna,
    ]);

    expect(await findActiveFamilyForSession(db.db, anna, session)).toBeNull();
  });
});
