// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyNameSchema } from "@offgrid/contracts";
import type { FamilyNameErrorTextId } from "../types.js";

export const validateFamilyName = (name: string): FamilyNameErrorTextId | undefined => {
  if (familyNameSchema.safeParse(name).success) {
    return undefined;
  }
  return name.trim().length === 0 ? "families.nameRequired" : "families.nameTooLong";
};
