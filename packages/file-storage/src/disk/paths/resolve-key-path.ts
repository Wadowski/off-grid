// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { join } from "node:path";
import { assertValidStorageKey } from "../../keys/assert-valid-storage-key.js";
import { shardSegmentsForKey } from "../../keys/shard-segments-for-key.js";
import { assertPathInsideDirectory } from "./assert-path-inside-directory.js";

export const resolveKeyPath = (directory: string, key: string): string => {
  assertValidStorageKey(key);
  const path = join(directory, ...shardSegmentsForKey(key), key);
  assertPathInsideDirectory(directory, path);
  return path;
};
