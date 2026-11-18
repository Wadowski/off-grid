// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { StorageFixture } from "./types.js";
import { sourceOf } from "./source-of.js";

export const storedKeyOf = async (fixture: StorageFixture, bytes: Buffer): Promise<string> => {
  const stored = await fixture.storage.put(sourceOf(bytes));
  return stored.key;
};
