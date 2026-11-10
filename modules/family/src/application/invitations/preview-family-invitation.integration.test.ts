// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../../test/start-family-test-database.js";
import { addFamilyMember } from "../../../test/add-family-member.js";
import { INVITATION_ATTEMPT_POLICY } from "../../constants.js";
import { createFamily } from "../create-family.js";
import { createFamilyInvitation } from "./create-family-invitation.js";
import { previewFamilyInvitation } from "./preview-family-invitation.js";
import { redeemFamilyInvitation } from "./redeem-family-invitation.js";

const createCode = async (db: FamilyTestDatabase, admin: string, familyId: string) => {
  const created = await createFamilyInvitation(db.db, admin, familyId);
  if (created.outcome !== "found") {
    throw new Error("the invitation was not created");
  }
  return created.value;
};

const nameAccount = async (db: FamilyTestDatabase, userId: string, displayName: string) => {
  await db.admin.query(
    "INSERT INTO family.account_name (user_id, display_name, source_version) VALUES ($1, $2, 1)",
    [userId, displayName],
  );
};

describe("previewFamilyInvitation", { timeout: 60_000 }, () => {
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

  it("shows the family and who invited the person, without joining or using the code", async () => {
    const admin = randomUUID();
    const joiner = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await nameAccount(db, admin, "Ada Novak");
    const invitation = await createCode(db, admin, family.id);

    const outcome = await previewFamilyInvitation(db.db, joiner, invitation.code);

    expect(outcome).toEqual({
      outcome: "found",
      value: {
        familyId: family.id,
        familyName: "Novak family",
        familyCreatedAt: family.createdAt,
        invitedBy: { displayName: "Ada Novak" },
      },
    });
    const membership = await db.admin.query(
      "SELECT 1 FROM family.family_member WHERE family_id = $1 AND user_id = $2",
      [family.id, joiner],
    );
    expect(membership.rows).toEqual([]);
    expect(await redeemFamilyInvitation(db.db, joiner, invitation.code)).toEqual({
      outcome: "joined",
      value: { familyId: family.id },
    });
  });

  it("returns no inviter name when the inviter has no display name copy", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);

    const outcome = await previewFamilyInvitation(db.db, randomUUID(), invitation.code);

    expect(outcome).toMatchObject({
      outcome: "found",
      value: { invitedBy: { displayName: null } },
    });
  });

  it("answers invalid for a code that was never issued", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await createCode(db, admin, family.id);

    expect(await previewFamilyInvitation(db.db, randomUUID(), "not-a-real-code")).toEqual({
      outcome: "invalid",
    });
  });

  it("answers invalid for a family the person already joined", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");
    const invitation = await createCode(db, admin, family.id);

    expect(await previewFamilyInvitation(db.db, member, invitation.code)).toEqual({
      outcome: "invalid",
    });
  });

  it("does not count a preview from an existing member towards the attempt limit", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");
    const invitation = await createCode(db, admin, family.id);

    for (let attempt = 0; attempt < INVITATION_ATTEMPT_POLICY.limit; attempt += 1) {
      expect(await previewFamilyInvitation(db.db, member, invitation.code)).toEqual({
        outcome: "invalid",
      });
    }

    expect(await previewFamilyInvitation(db.db, member, invitation.code)).toEqual({
      outcome: "invalid",
    });
  });

  it("answers invalid for a spent or revoked code", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);
    await redeemFamilyInvitation(db.db, randomUUID(), invitation.code);

    expect(await previewFamilyInvitation(db.db, randomUUID(), invitation.code)).toEqual({
      outcome: "invalid",
    });
  });

  it("counts failed previews towards the attempt limit", async () => {
    const admin = randomUUID();
    const joiner = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);

    for (let attempt = 0; attempt < INVITATION_ATTEMPT_POLICY.limit; attempt += 1) {
      expect(await previewFamilyInvitation(db.db, joiner, "wrong-code")).toEqual({
        outcome: "invalid",
      });
    }

    expect(await previewFamilyInvitation(db.db, joiner, invitation.code)).toEqual({
      outcome: "rate-limited",
    });
  });

  it("answers invalid for a revoked code", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);
    await db.admin.query("UPDATE family.invitation SET revoked_at = now() WHERE family_id = $1", [
      family.id,
    ]);

    expect(await previewFamilyInvitation(db.db, randomUUID(), invitation.code)).toEqual({
      outcome: "invalid",
    });
  });

  it("answers invalid for an expired code", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);
    await db.admin.query(
      "UPDATE family.invitation SET expires_at = now() - interval '1 day' WHERE family_id = $1",
      [family.id],
    );

    expect(await previewFamilyInvitation(db.db, randomUUID(), invitation.code)).toEqual({
      outcome: "invalid",
    });
  });
});
