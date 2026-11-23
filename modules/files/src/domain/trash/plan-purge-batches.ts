// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileRecord } from "../../types.js";

export const planPurgeBatches = (
  breadthFirstSubtree: readonly FileRecord[],
  batchSize: number,
): FileRecord[][] => {
  const deepestFirst = [...breadthFirstSubtree].reverse();
  const batches: FileRecord[][] = [];
  for (let start = 0; start < deepestFirst.length; start += batchSize) {
    batches.push(deepestFirst.slice(start, start + batchSize));
  }
  return batches;
};
