// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyNameSchema } from "@offgrid/contracts";

export const validateFamilyName = (
  name: string,
): "families.nameRequired" | "families.nameTooLong" | undefined => {
  if (familyNameSchema.safeParse(name).success) {
    return undefined;
  }
  return name.trim().length === 0 ? "families.nameRequired" : "families.nameTooLong";
};
