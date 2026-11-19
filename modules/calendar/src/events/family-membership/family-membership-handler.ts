// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createFamilyMembershipHandler } from "@offgrid/family-projection";
import type { FamilyMembershipHandler } from "@offgrid/family-projection";
import { calendarMembershipStore } from "./calendar-membership-store.js";

export const familyMembershipHandler: FamilyMembershipHandler =
  createFamilyMembershipHandler(calendarMembershipStore);
