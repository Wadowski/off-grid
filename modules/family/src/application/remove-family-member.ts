// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberRemovedV1 } from "@offgrid/contracts";
import type { ModuleDatabase } from "@offgrid/db";
import { keepsAnAdmin } from "../domain/keeps-an-admin.js";
import { publishFamilyEvent } from "../events/publish-family-event.js";
import { bumpMembershipVersion } from "../infrastructure/bump-membership-version.js";
import { countAdmins } from "../infrastructure/count-admins.js";
import { deleteMembership } from "../infrastructure/delete-membership.js";
import { findMembership } from "../infrastructure/find-membership.js";
import type { FamilyMember, MembershipChangeOutcome } from "../types.js";
import { requireFamilyAdmin, requireFamilyMember } from "./require-family-admin.js";

export const removeFamilyMember = async (
  db: ModuleDatabase,
  actorUserId: string,
  familyId: string,
  targetUserId: string,
): Promise<MembershipChangeOutcome<FamilyMember>> =>
  db.$transaction(async (tx) => {
    const leavesItself = actorUserId === targetUserId;
    const actor = leavesItself
      ? await requireFamilyMember(tx, actorUserId, familyId)
      : await requireFamilyAdmin(tx, actorUserId, familyId);
    if (actor.outcome !== "found") {
      return actor;
    }
    const target = await findMembership(tx, familyId, targetUserId);
    if (target === null) {
      return { outcome: "not-found" };
    }
    const adminCount = await countAdmins(tx, familyId);
    if (!keepsAnAdmin({ currentRole: target.role, nextRole: null, adminCount })) {
      return { outcome: "last-admin" };
    }
    await deleteMembership(tx, familyId, targetUserId);
    const sourceVersion = await bumpMembershipVersion(tx, familyId, targetUserId);
    await publishFamilyEvent(
      tx,
      familyMemberRemovedV1,
      familyId,
      { userId: targetUserId },
      sourceVersion,
    );
    return { outcome: "found", value: target };
  });
