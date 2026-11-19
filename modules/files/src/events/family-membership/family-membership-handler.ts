// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createFamilyMembershipHandler } from "@offgrid/family-projection";
import { filesMembershipStore } from "./files-membership-store.js";

export const familyMembershipHandler = createFamilyMembershipHandler(filesMembershipStore);
