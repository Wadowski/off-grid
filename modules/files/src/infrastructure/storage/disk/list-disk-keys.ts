// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { join } from "node:path";
import { isShardSegment } from "../../../domain/storage/is-shard-segment.js";
import { isValidStorageKey } from "../../../domain/storage/is-valid-storage-key.js";
import type { StoredObjectEntry } from "../../../types.js";
import { listEntryNames } from "./list-entry-names.js";
import { statModifiedAt } from "./stat-modified-at.js";

export async function* listDiskKeys(directory: string): AsyncGenerator<StoredObjectEntry> {
  for (const first of await listEntryNames(directory, "directory", isShardSegment)) {
    for (const second of await listEntryNames(join(directory, first), "directory", isShardSegment)) {
      const shardPrefix = `${first}${second}`;
      const shardPath = join(directory, first, second);
      const acceptsKey = (name: string): boolean =>
        isValidStorageKey(name) && name.startsWith(shardPrefix);
      for (const key of await listEntryNames(shardPath, "file", acceptsKey)) {
        const modifiedAt = await statModifiedAt(join(shardPath, key));
        if (modifiedAt !== undefined) {
          yield { key, modifiedAt };
        }
      }
    }
  }
}
