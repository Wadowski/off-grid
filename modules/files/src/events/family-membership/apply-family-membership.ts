// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { applyMembershipChange, type MembershipChange } from "@offgrid/family-projection";
import { filesMembershipStore } from "./files-membership-store.js";

export const applyFamilyMembership = (
  tx: ModuleTransaction,
  change: MembershipChange,
): Promise<void> => applyMembershipChange(tx, change, filesMembershipStore);
