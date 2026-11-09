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
import { createFamilyInvitation } from "./create-family-invitation.js";
import { revokeFamilyInvitation } from "./revoke-family-invitation.js";

describe("revokeFamilyInvitation", { timeout: 60_000 }, () => {
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

  it("lets an admin revoke an unused invitation", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const created = await createFamilyInvitation(db.db, admin, family.id);
    if (created.outcome !== "found") {
      throw new Error("the invitation was not created");
    }

    const outcome = await revokeFamilyInvitation(
      db.db,
      admin,
      family.id,
      created.value.invitationId,
    );

    expect(outcome).toEqual({
      outcome: "found",
      value: { invitationId: created.value.invitationId },
    });
    const { rows } = await db.admin.query(
      "SELECT revoked_at FROM family.invitation WHERE invitation_id = $1",
      [created.value.invitationId],
    );
    expect(rows[0]?.revoked_at).not.toBeNull();
  });

  it("answers not-found when the invitation was already revoked", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const created = await createFamilyInvitation(db.db, admin, family.id);
    if (created.outcome !== "found") {
      throw new Error("the invitation was not created");
    }
    await revokeFamilyInvitation(db.db, admin, family.id, created.value.invitationId);

    expect(
      await revokeFamilyInvitation(db.db, admin, family.id, created.value.invitationId),
    ).toEqual({ outcome: "not-found" });
  });

  it("refuses a member, who cannot revoke invitations", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");
    const created = await createFamilyInvitation(db.db, admin, family.id);
    if (created.outcome !== "found") {
      throw new Error("the invitation was not created");
    }

    expect(
      await revokeFamilyInvitation(db.db, member, family.id, created.value.invitationId),
    ).toEqual({ outcome: "forbidden" });
  });
});
