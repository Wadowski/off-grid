// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { StoredObjectEntry } from "../src/types.js";

export const collectEntries = async (
  entries: AsyncIterable<StoredObjectEntry>,
): Promise<StoredObjectEntry[]> => {
  const collected: StoredObjectEntry[] = [];
  for await (const entry of entries) {
    collected.push(entry);
  }
  return collected;
};
