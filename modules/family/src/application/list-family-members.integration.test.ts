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
import { listFamilyMembers } from "./list-family-members.js";

describe("listFamilyMembers", { timeout: 60_000 }, () => {
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

  it("lists every member with their role to a member of the family", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const outcome = await listFamilyMembers(db.db, member, family.id);

    expect(outcome.outcome).toBe("found");
    if (outcome.outcome !== "found") {
      return;
    }
    expect(outcome.value.members.map((entry) => [entry.userId, entry.role])).toEqual([
      [admin, "admin"],
      [member, "member"],
    ]);
  });

  it("reports a family to a user outside it as not found", async () => {
    const family = await createFamily(db.db, randomUUID(), "Novak family");

    expect(await listFamilyMembers(db.db, randomUUID(), family.id)).toEqual({
      outcome: "not-found",
    });
  });
});
