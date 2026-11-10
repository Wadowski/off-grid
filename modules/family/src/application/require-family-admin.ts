// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { canManageFamilyMembers, type ReadOutcome } from "@offgrid/access-control";
import { withFamilyContext, withUserContext, type ModuleTransaction } from "@offgrid/db";
import { findMembership } from "../infrastructure/find-membership.js";
import { lockFamilyMembership } from "../infrastructure/lock-family-membership.js";
import type { FamilyMember } from "../types.js";

export const requireFamilyMember = async (
  tx: ModuleTransaction,
  actorUserId: string,
  familyId: string,
): Promise<ReadOutcome<FamilyMember>> => {
  await withUserContext(tx, actorUserId);
  await lockFamilyMembership(tx, familyId);
  const actor = await findMembership(tx, familyId, actorUserId);
  if (actor === null) {
    return { outcome: "not-found" };
  }
  await withFamilyContext(tx, familyId);
  return { outcome: "found", value: actor };
};

export const requireFamilyAdmin = async (
  tx: ModuleTransaction,
  actorUserId: string,
  familyId: string,
): Promise<ReadOutcome<FamilyMember>> => {
  const actor = await requireFamilyMember(tx, actorUserId, familyId);
  if (actor.outcome !== "found") {
    return actor;
  }
  return canManageFamilyMembers(actor.value.role) ? actor : { outcome: "forbidden" };
};
