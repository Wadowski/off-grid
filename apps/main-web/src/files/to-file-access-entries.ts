// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive, FamilyMemberEntry, FileAccessEntry } from "./types.js";

export const toFileAccessEntries = (
  drive: Pick<Drive, "familyId">,
  members: readonly FamilyMemberEntry[],
  viewer: { readonly id: string; readonly displayName: string },
): readonly FileAccessEntry[] => {
  if (drive.familyId === null) {
    return [{ userId: viewer.id, name: viewer.displayName, role: "owner" }];
  }
  return members.map((member) => ({
    userId: member.userId,
    name: member.displayName,
    role: member.role,
  }));
};
