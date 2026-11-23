// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyMemberEntry } from "./types.js";

export const toMemberName = (
  userId: string,
  members: readonly FamilyMemberEntry[],
  viewer: { readonly id: string; readonly displayName: string } | null,
): string | null => {
  if (viewer !== null && viewer.id === userId) {
    return viewer.displayName;
  }
  return members.find((member) => member.userId === userId)?.displayName ?? null;
};
