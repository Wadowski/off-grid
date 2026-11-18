// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { resolveByteRange } from "./resolve-byte-range.js";
import { StorageRangeNotSatisfiableError } from "../errors/storage-range-not-satisfiable-error.js";
import type { ByteRange } from "../types.js";

export const resolveRequestedRange = (
  sizeBytes: number,
  range: ByteRange | undefined,
): { readonly start: number; readonly length: number } => {
  if (range === undefined) {
    return { start: 0, length: sizeBytes };
  }
  const resolved = resolveByteRange(sizeBytes, range.start, range.end ?? sizeBytes - 1);
  if (resolved === null) {
    throw new StorageRangeNotSatisfiableError();
  }
  return resolved;
};
