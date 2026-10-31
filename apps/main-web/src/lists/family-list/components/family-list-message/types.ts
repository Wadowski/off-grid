// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FamilyListMessageContent = {
  readonly variant: "status" | "error";
  readonly textId: "families.loading" | "families.listFailed" | "families.empty";
  readonly role?: "status" | "alert";
  readonly testId?: string;
};
