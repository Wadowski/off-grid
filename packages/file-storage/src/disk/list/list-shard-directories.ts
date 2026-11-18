// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { join } from "node:path";
import { Readable } from "node:stream";
import { isShardSegment } from "../../keys/is-shard-segment.js";
import { listEntryNames } from "./list-entry-names.js";

export const listShardDirectories = (parents: Readable): Readable =>
  parents.flatMap(async (parent: string) =>
    (await listEntryNames(parent, "directory", isShardSegment)).map((name) => join(parent, name)),
  );
