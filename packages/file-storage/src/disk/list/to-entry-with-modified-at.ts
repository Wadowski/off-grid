// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ShardKeyFile, StoredObjectEntry } from "../../types.js";
import { statModifiedAt } from "./stat-modified-at.js";

export const toEntryWithModifiedAt = async ({
  key,
  path,
}: ShardKeyFile): Promise<StoredObjectEntry[]> => {
  const modifiedAt = await statModifiedAt(path);
  return modifiedAt === undefined ? [] : [{ key, modifiedAt }];
};
