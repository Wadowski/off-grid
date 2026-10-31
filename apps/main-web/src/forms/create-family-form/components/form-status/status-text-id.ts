// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateFamilyStatus } from "../../../../types.js";

export const createFamilyStatusTextId = (
  status: CreateFamilyStatus,
): "families.createFailed" | "families.waitingForList" | undefined => {
  if (status === "failed") {
    return "families.createFailed";
  }
  if (status === "waiting-for-list") {
    return "families.waitingForList";
  }
  return undefined;
};
