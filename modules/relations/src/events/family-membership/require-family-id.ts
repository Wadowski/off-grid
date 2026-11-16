// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FamilyMembershipWithoutFamilyError } from "../../application/errors/family-membership-without-family-error.js";

export const requireFamilyId = (familyId: string | null): string => {
  if (familyId === null) {
    throw new FamilyMembershipWithoutFamilyError();
  }
  return familyId;
};
