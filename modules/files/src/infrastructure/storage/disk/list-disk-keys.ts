// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Readable } from "node:stream";
import { listKeyFilesInShard } from "./list-key-files-in-shard.js";
import { listTwoLevelShardDirectories } from "./list-two-level-shard-directories.js";
import { toEntryWithModifiedAt } from "./to-entry-with-modified-at.js";

export const listDiskKeys = (directory: string): Readable =>
  listTwoLevelShardDirectories(directory)
    .flatMap(listKeyFilesInShard)
    .flatMap(toEntryWithModifiedAt);
