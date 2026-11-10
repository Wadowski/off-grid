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
import { removeFamilyMember } from "../remove-family-member.js";
import { findActiveFamilyForSession } from "./find-active-family-for-session.js";
import { selectActiveFamily } from "./select-active-family.js";

describe("findActiveFamilyForSession", { timeout: 60_000 }, () => {
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

  it("returns null when the session has made no choice", async () => {
    expect(await findActiveFamilyForSession(db.db, randomUUID(), randomUUID())).toBeNull();
  });

  it("forgets a family the person has left, even though it was chosen for the session", async () => {
    const user = randomUUID();
    const sessionId = randomUUID();
    const family = await createFamily(db.db, randomUUID(), "Cabin Circle");
    await addFamilyMember(db.db, family.id, user, "member");
    await selectActiveFamily(db.db, user, sessionId, family.id);

    await removeFamilyMember(db.db, user, family.id, user);

    expect(await findActiveFamilyForSession(db.db, user, sessionId)).toBeNull();
  });
});
