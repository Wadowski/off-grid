// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ByteSpan } from "../../types.js";

export const resolveRangeSpan = (
  sizeBytes: number,
  startText: string,
  endText: string,
): ByteSpan | "unsatisfiable" | null => {
  if (startText === "") {
    const suffixLength = Number(endText);
    return sizeBytes === 0 || suffixLength === 0
      ? "unsatisfiable"
      : { start: Math.max(sizeBytes - suffixLength, 0), end: sizeBytes - 1 };
  }
  const start = Number(startText);
  const end = endText === "" ? Number.POSITIVE_INFINITY : Number(endText);
  if (end < start) {
    return null;
  }
  if (!Number.isSafeInteger(start) || start >= sizeBytes) {
    return "unsatisfiable";
  }
  return { start, end: Math.min(end, sizeBytes - 1) };
};
