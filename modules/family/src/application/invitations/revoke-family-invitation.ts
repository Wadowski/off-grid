// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadOutcome } from "@offgrid/access-control";
import type { ModuleDatabase } from "@offgrid/db";
import { revokeInvitation } from "../../infrastructure/invitations/revoke-invitation.js";
import type { FamilyInvitationRef } from "../../types.js";
import { requireFamilyAdmin } from "../require-family-admin.js";

export const revokeFamilyInvitation = (
  db: ModuleDatabase,
  actorUserId: string,
  familyId: string,
  invitationId: string,
): Promise<ReadOutcome<FamilyInvitationRef>> =>
  db.$transaction(async (tx) => {
    const admin = await requireFamilyAdmin(tx, actorUserId, familyId);
    if (admin.outcome !== "found") {
      return admin;
    }
    const revoked = await revokeInvitation(tx, familyId, invitationId, new Date());
    return revoked ? { outcome: "found", value: { invitationId } } : { outcome: "not-found" };
  });
