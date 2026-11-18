// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Readable } from "node:stream";
import { listShardDirectories } from "./list-shard-directories.js";

export const listTwoLevelShardDirectories = (directory: string): Readable =>
  listShardDirectories(listShardDirectories(Readable.from([directory])));
