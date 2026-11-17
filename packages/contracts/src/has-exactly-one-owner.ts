// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const hasExactlyOneOwner = (userId: string | null, familyId: string | null): boolean =>
  (userId === null) !== (familyId === null);
