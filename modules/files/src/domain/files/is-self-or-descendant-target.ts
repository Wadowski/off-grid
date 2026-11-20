// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isSelfOrDescendantTarget = (
  movedFileId: string,
  targetPathIds: readonly string[],
): boolean => targetPathIds.includes(movedFileId);
