// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../../test/start-family-test-database.js";
import { addFamilyMember } from "../../../test/add-family-member.js";
import { INVITATION_LIFETIME_MS } from "../../constants.js";
import { createFamily } from "../create-family.js";
import { createFamilyInvitation } from "./create-family-invitation.js";

describe("createFamilyInvitation", { timeout: 60_000 }, () => {
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

  it("lets an admin create an invitation that expires in seven days and stores only its hash", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const before = Date.now();

    const outcome = await createFamilyInvitation(db.db, admin, family.id);

    expect(outcome.outcome).toBe("found");
    if (outcome.outcome !== "found") {
      return;
    }
    const { code, expiresAt } = outcome.value;
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + INVITATION_LIFETIME_MS);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + INVITATION_LIFETIME_MS);
    const { rows } = await db.admin.query(
      "SELECT code_hash FROM family.invitation WHERE invitation_id = $1",
      [outcome.value.invitationId],
    );
    expect(rows).toEqual([{ code_hash: createHash("sha256").update(code).digest("hex") }]);
    expect(code.length).toBeGreaterThanOrEqual(22);
  });

  it("refuses a member, who cannot create invitations", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    expect(await createFamilyInvitation(db.db, member, family.id)).toEqual({
      outcome: "forbidden",
    });
  });

  it("answers not-found to someone outside the family", async () => {
    const family = await createFamily(db.db, randomUUID(), "Novak family");

    expect(await createFamilyInvitation(db.db, randomUUID(), family.id)).toEqual({
      outcome: "not-found",
    });
  });
});
