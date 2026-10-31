// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilySummary, ListStatus } from "../../../../types.js";
import type { FamilyListMessageContent } from "./types.js";

export const familyListMessageContent = (
  families: readonly FamilySummary[],
  listStatus: ListStatus,
): FamilyListMessageContent | undefined => {
  if (listStatus === "loading" && families.length === 0) {
    return { variant: "status", textId: "families.loading", role: "status" };
  }
  if (listStatus === "failed") {
    return { variant: "error", textId: "families.listFailed", role: "alert" };
  }
  if (families.length === 0) {
    return { variant: "status", textId: "families.empty", testId: "family-list-empty" };
  }
  return undefined;
};
