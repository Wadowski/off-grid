// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyMembershipStore } from "@offgrid/family-projection";
import { findFilesMembership } from "./find-files-membership.js";
import { writeFilesMembership } from "./write-files-membership.js";

export const filesMembershipStore: FamilyMembershipStore = {
  findStored: findFilesMembership,
  write: writeFilesMembership,
};
