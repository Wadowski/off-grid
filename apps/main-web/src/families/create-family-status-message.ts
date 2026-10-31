// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TFunction } from "i18next";
import type { CreateFamilyStatus } from "../types.js";

export const createFamilyStatusMessage = (status: CreateFamilyStatus, t: TFunction): string => {
  if (status === "failed") {
    return t("families.createFailed");
  }
  if (status === "waiting-for-list") {
    return t("families.waitingForList");
  }
  return "";
};
