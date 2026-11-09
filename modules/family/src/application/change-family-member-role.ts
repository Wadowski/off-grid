// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyRole } from "@offgrid/access-control";
import { familyMemberUpdatedV1 } from "@offgrid/contracts";
import type { ModuleDatabase } from "@offgrid/db";
import { publishFamilyEvent } from "../events/publish-family-event.js";
import { countAdmins } from "../infrastructure/count-admins.js";
import { findMembership } from "../infrastructure/find-membership.js";
import { updateMemberRole } from "../infrastructure/update-member-role.js";
import { keepsAnAdmin } from "../domain/keeps-an-admin.js";
import type { FamilyMember, MembershipChangeOutcome } from "../types.js";
import { requireFamilyAdmin } from "./require-family-admin.js";

export const changeFamilyMemberRole = async (
  db: ModuleDatabase,
  actorUserId: string,
  familyId: string,
  targetUserId: string,
  role: FamilyRole,
): Promise<MembershipChangeOutcome<FamilyMember>> =>
  db.$transaction(async (tx) => {
    const admin = await requireFamilyAdmin(tx, actorUserId, familyId);
    if (admin.outcome !== "found") {
      return admin;
    }
    const target = await findMembership(tx, familyId, targetUserId);
    if (target === null) {
      return { outcome: "not-found" };
    }
    if (target.role === role) {
      return { outcome: "found", value: target };
    }
    const adminCount = await countAdmins(tx, familyId);
    if (!keepsAnAdmin({ currentRole: target.role, nextRole: role, adminCount })) {
      return { outcome: "last-admin" };
    }
    const updated = await updateMemberRole(tx, familyId, targetUserId, role);
    await publishFamilyEvent(tx, familyMemberUpdatedV1, familyId, { userId: targetUserId, role });
    return { outcome: "found", value: updated };
  });
