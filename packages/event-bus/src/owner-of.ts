// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const ownerOf = (
  familyId: string | null,
  userId: string | undefined,
): { familyId: string | null; userId: string | null } => {
  if (familyId !== null && userId === undefined) {
    return { familyId, userId: null };
  }
  if (familyId === null && userId !== undefined) {
    return { familyId: null, userId };
  }
  throw new Error("an event has exactly one owner: a family, or a user when it has no family");
};
