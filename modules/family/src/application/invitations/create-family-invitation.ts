// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadOutcome } from "@offgrid/access-control";
import type { ModuleDatabase } from "@offgrid/db";
import { INVITATION_LIFETIME_MS } from "../../constants.js";
import { generateInvitationCode } from "../../infrastructure/invitations/generate-invitation-code.js";
import { hashInvitationCode } from "../../infrastructure/invitations/hash-invitation-code.js";
import { insertInvitation } from "../../infrastructure/invitations/insert-invitation.js";
import type { FamilyInvitationCreated } from "../../types.js";
import { requireFamilyAdmin } from "../require-family-admin.js";

export const createFamilyInvitation = (
  db: ModuleDatabase,
  actorUserId: string,
  familyId: string,
): Promise<ReadOutcome<FamilyInvitationCreated>> =>
  db.$transaction(async (tx) => {
    const admin = await requireFamilyAdmin(tx, actorUserId, familyId);
    if (admin.outcome !== "found") {
      return admin;
    }
    const now = new Date();
    const code = generateInvitationCode();
    const invitation = await insertInvitation(tx, {
      familyId,
      codeHash: hashInvitationCode(code),
      createdBy: actorUserId,
      expiresAt: new Date(now.getTime() + INVITATION_LIFETIME_MS),
      now,
    });
    return {
      outcome: "found",
      value: { invitationId: invitation.invitationId, code, expiresAt: invitation.expiresAt },
    };
  });
