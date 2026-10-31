// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateFamilyStatus } from "../../../../types.js";

export const createFamilyStatusTextId = (
  status: CreateFamilyStatus,
): "families.createFailed" | undefined => {
  if (status === "failed") {
    return "families.createFailed";
  }
  return undefined;
};
