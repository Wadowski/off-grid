// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../../test/start-family-test-database.js";
import { INVITATION_ATTEMPT_POLICY } from "../../constants.js";
import { getFamily } from "../get-family.js";
import { createFamily } from "../create-family.js";
import { createFamilyInvitation } from "./create-family-invitation.js";
import { redeemFamilyInvitation } from "./redeem-family-invitation.js";
import { revokeFamilyInvitation } from "./revoke-family-invitation.js";

const createCode = async (db: FamilyTestDatabase, admin: string, familyId: string) => {
  const created = await createFamilyInvitation(db.db, admin, familyId);
  if (created.outcome !== "found") {
    throw new Error("the invitation was not created");
  }
  return created.value;
};

describe("redeemFamilyInvitation", { timeout: 60_000 }, () => {
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

  it("makes the redeeming account a member of the family with the member role", async () => {
    const admin = randomUUID();
    const joiner = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);

    const outcome = await redeemFamilyInvitation(db.db, joiner, invitation.code);

    expect(outcome).toEqual({ outcome: "joined", value: { familyId: family.id } });
    expect(await getFamily(db.db, joiner, family.id)).toMatchObject({ outcome: "found" });
    const { rows } = await db.admin.query(
      "SELECT role FROM family.family_member WHERE family_id = $1 AND user_id = $2",
      [family.id, joiner],
    );
    expect(rows).toEqual([{ role: "member" }]);
    const events = await db.admin.query(
      "SELECT count(*)::int AS n FROM outbox.event WHERE type = 'family-member-added-v1' AND family_id = $1 AND payload->>'userId' = $2",
      [family.id, joiner],
    );
    expect(events.rows).toEqual([{ n: 1 }]);
  });

  it("accepts a code only once", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);
    await redeemFamilyInvitation(db.db, randomUUID(), invitation.code);

    expect(await redeemFamilyInvitation(db.db, randomUUID(), invitation.code)).toEqual({
      outcome: "invalid",
    });
  });

  it("gives the same answer for an unknown, revoked, expired or already used code", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const revoked = await createCode(db, admin, family.id);
    await revokeFamilyInvitation(db.db, admin, family.id, revoked.invitationId);
    const expired = await createCode(db, admin, family.id);
    await db.admin.query(
      "UPDATE family.invitation SET expires_at = now() - interval '1 second' WHERE invitation_id = $1",
      [expired.invitationId],
    );
    const used = await createCode(db, admin, family.id);
    await redeemFamilyInvitation(db.db, randomUUID(), used.code);

    const answers = await Promise.all(
      ["not-a-real-code", revoked.code, expired.code, used.code].map((code) =>
        redeemFamilyInvitation(db.db, randomUUID(), code),
      ),
    );

    expect(answers).toEqual([
      { outcome: "invalid" },
      { outcome: "invalid" },
      { outcome: "invalid" },
      { outcome: "invalid" },
    ]);
  });

  it("does not consume the code when the account is already a member", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);

    for (let attempt = 0; attempt < INVITATION_ATTEMPT_POLICY.limit; attempt += 1) {
      expect(await redeemFamilyInvitation(db.db, admin, invitation.code)).toEqual({
        outcome: "invalid",
      });
    }
    const { rows } = await db.admin.query(
      "SELECT used_at FROM family.invitation WHERE invitation_id = $1",
      [invitation.invitationId],
    );
    expect(rows).toEqual([{ used_at: null }]);
    const attempts = await db.admin.query(
      "SELECT count(*)::int AS n FROM family.invitation_attempt",
    );
    expect(attempts.rows).toEqual([{ n: 0 }]);
    expect(await redeemFamilyInvitation(db.db, admin, invitation.code)).toEqual({
      outcome: "invalid",
    });
  });

  it("blocks an account after too many wrong codes, even with a valid code, until the lockout ends", async () => {
    const admin = randomUUID();
    const joiner = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);

    for (let attempt = 0; attempt < INVITATION_ATTEMPT_POLICY.limit; attempt += 1) {
      expect(await redeemFamilyInvitation(db.db, joiner, "wrong-code")).toEqual({
        outcome: "invalid",
      });
    }

    expect(await redeemFamilyInvitation(db.db, joiner, invitation.code)).toEqual({
      outcome: "rate-limited",
    });

    await db.admin.query(
      "UPDATE family.invitation_attempt SET locked_until = now() - interval '1 second' WHERE user_id = $1",
      [joiner],
    );
    expect(await redeemFamilyInvitation(db.db, joiner, invitation.code)).toEqual({
      outcome: "joined",
      value: { familyId: family.id },
    });
  });

  it("keeps the lockout per account, so another account can still redeem", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const invitation = await createCode(db, admin, family.id);
    const locked = randomUUID();
    for (let attempt = 0; attempt < INVITATION_ATTEMPT_POLICY.limit; attempt += 1) {
      await redeemFamilyInvitation(db.db, locked, "wrong-code");
    }

    expect(await redeemFamilyInvitation(db.db, randomUUID(), invitation.code)).toEqual({
      outcome: "joined",
      value: { familyId: family.id },
    });
  });
});
