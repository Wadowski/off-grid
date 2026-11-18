// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Readable } from "node:stream";
import { StorageObjectNotFoundError } from "../../../application/errors/storage-object-not-found-error.js";
import { assertValidStorageKey } from "../../../application/storage/assert-valid-storage-key.js";
import { resolveRequestedRange } from "../../../application/storage/resolve-requested-range.js";
import type { ByteRange } from "../../../types.js";

export const readInMemoryObject = async (
  objects: Map<string, Buffer>,
  key: string,
  range: ByteRange | undefined,
): Promise<Readable> => {
  assertValidStorageKey(key);
  const bytes = objects.get(key);
  if (bytes === undefined) {
    throw new StorageObjectNotFoundError();
  }
  const { start, length } = resolveRequestedRange(bytes.length, range);
  return Readable.from([bytes.subarray(start, start + length)]);
};
