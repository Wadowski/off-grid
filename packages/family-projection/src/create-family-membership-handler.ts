// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { applyMembershipChange } from "./apply-membership-change.js";
import { membershipChangeOf } from "./membership-change-of.js";
import type { FamilyMembershipHandler, FamilyMembershipStore } from "./types.js";

export const createFamilyMembershipHandler =
  (store: FamilyMembershipStore): FamilyMembershipHandler =>
  async (db, event) => {
    await db.$transaction((tx) => applyMembershipChange(tx, membershipChangeOf(event), store));
  };
