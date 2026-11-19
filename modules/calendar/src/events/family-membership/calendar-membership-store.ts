// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyMembershipStore } from "@offgrid/family-projection";
import { findCalendarMembership } from "./find-calendar-membership.js";
import { writeCalendarMembership } from "./write-calendar-membership.js";

export const calendarMembershipStore: FamilyMembershipStore = {
  findStored: findCalendarMembership,
  write: writeCalendarMembership,
};
