// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withFamilyContext, type ModuleTransaction } from "@offgrid/db";
import { classifySourceVersion } from "@offgrid/event-bus";
import { FamilyMembershipOutOfOrderError } from "../../application/errors/family-membership-out-of-order-error.js";
import { findFamilyMember } from "../../infrastructure/family-member/find-family-member.js";
import { upsertFamilyMember } from "../../infrastructure/family-member/upsert-family-member.js";
import type { FamilyMembershipChange } from "../../types.js";

export const applyFamilyMembership = async (
  tx: ModuleTransaction,
  change: FamilyMembershipChange,
): Promise<void> => {
  await withFamilyContext(tx, change.familyId);
  const stored = await findFamilyMember(tx, change);
  const decision = classifySourceVersion(stored?.sourceVersion ?? null, change.sourceVersion);
  if (decision === "duplicate" || decision === "stale") {
    return;
  }
  if (decision === "gap" && stored !== null) {
    throw new FamilyMembershipOutOfOrderError();
  }
  const isMember = decision === "apply" && change.isMember;
  await upsertFamilyMember(tx, { ...change, isMember });
};
