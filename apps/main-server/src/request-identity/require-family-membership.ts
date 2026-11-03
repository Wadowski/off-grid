// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { ApiError } from "../http/errors/api-error.js";
import type { FamilyMembershipLister } from "../types.js";
import { FORBIDDEN_FAMILY_MESSAGE } from "../constants.js";

export const requireFamilyMembership = async (
  db: ModuleDatabase,
  userId: string,
  familyId: string,
  listFamilies: FamilyMembershipLister,
): Promise<void> => {
  const families = await listFamilies(db, userId);
  if (!families.some((family) => family.id === familyId)) {
    throw new ApiError(403, "FORBIDDEN", FORBIDDEN_FAMILY_MESSAGE);
  }
};
