// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { resolveRequestedRange } from "../../../application/storage/resolve-requested-range.js";
import type { ByteRange } from "../../../types.js";
import { resolveKeyPath } from "./resolve-key-path.js";
import { statStoredObjectSize } from "./stat-stored-object-size.js";

export const readDiskObject = async (
  directory: string,
  key: string,
  range: ByteRange | undefined,
): Promise<Readable> => {
  const path = resolveKeyPath(directory, key);
  const sizeBytes = await statStoredObjectSize(path);
  const { start, length } = resolveRequestedRange(sizeBytes, range);
  if (length === 0) {
    return Readable.from([]);
  }
  return createReadStream(path, { start, end: start + length - 1 });
};
