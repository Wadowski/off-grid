// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { join } from "node:path";
import type { ShardKeyFile } from "../../../types.js";
import { isValidStorageKey } from "../../../domain/storage/is-valid-storage-key.js";
import { listEntryNames } from "./list-entry-names.js";
import { shardPrefixOf } from "./shard-prefix-of.js";

export const listKeyFilesInShard = async (shardPath: string): Promise<ShardKeyFile[]> => {
  const prefix = shardPrefixOf(shardPath);
  const acceptsKey = (name: string): boolean => isValidStorageKey(name) && name.startsWith(prefix);
  return (await listEntryNames(shardPath, "file", acceptsKey)).map((key) => ({
    key,
    path: join(shardPath, key),
  }));
};
