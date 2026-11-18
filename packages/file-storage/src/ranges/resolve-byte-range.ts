// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const resolveByteRange = (
  sizeBytes: number,
  start: number,
  endInclusive: number,
): { readonly start: number; readonly length: number } | null => {
  const isWholeNumberInside =
    Number.isSafeInteger(start) &&
    Number.isSafeInteger(endInclusive) &&
    start >= 0 &&
    start <= endInclusive &&
    endInclusive < sizeBytes;
  return isWholeNumberInside ? { start, length: endInclusive - start + 1 } : null;
};
