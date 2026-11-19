// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const toByteSize = (sizeBytes: bigint): number => {
  if (sizeBytes > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("A file size is too large to represent");
  }
  return Number(sizeBytes);
};
