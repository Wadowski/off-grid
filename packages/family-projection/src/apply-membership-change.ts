// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withFamilyContext, type ModuleTransaction } from "@offgrid/db";
import { applyMembershipVersion } from "./apply-membership-version.js";
import type { FamilyMembershipStore, MembershipChange } from "./types.js";

export const applyMembershipChange = async (
  tx: ModuleTransaction,
  change: MembershipChange,
  store: FamilyMembershipStore,
): Promise<void> => {
  await withFamilyContext(tx, change.familyId);
  const stored = await store.findStored(tx, change.familyId, change.userId);
  const decision = applyMembershipVersion(stored, change);
  if (decision === "skip") {
    return;
  }
  await store.write(tx, change, decision.isMember);
};
