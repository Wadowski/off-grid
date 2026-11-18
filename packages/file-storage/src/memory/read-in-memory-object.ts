// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Readable } from "node:stream";
import { StorageObjectNotFoundError } from "../errors/storage-object-not-found-error.js";
import { assertValidStorageKey } from "../keys/assert-valid-storage-key.js";
import { resolveRequestedRange } from "../ranges/resolve-requested-range.js";
import type { ByteRange, InMemoryObject } from "../types.js";

export const readInMemoryObject = async (
  objects: Map<string, InMemoryObject>,
  key: string,
  range: ByteRange | undefined,
): Promise<Readable> => {
  assertValidStorageKey(key);
  const object = objects.get(key);
  if (object === undefined) {
    throw new StorageObjectNotFoundError();
  }
  const { start, length } = resolveRequestedRange(object.bytes.length, range);
  return Readable.from([object.bytes.subarray(start, start + length)]);
};
