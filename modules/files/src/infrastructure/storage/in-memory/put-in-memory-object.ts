// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";
import { allocateStorageKey } from "../../../application/storage/allocate-storage-key.js";
import type { InMemoryObject, PutOptions, StoredObject } from "../../../types.js";
import { collectBytes } from "./collect-bytes.js";

export const putInMemoryObject = async (
  objects: Map<string, InMemoryObject>,
  source: AsyncIterable<Uint8Array>,
  options: PutOptions = {},
): Promise<StoredObject> => {
  const bytes = await collectBytes(source, options.signal);
  const key = await allocateStorageKey(async (candidate) => objects.has(candidate));
  objects.set(key, { bytes, modifiedAt: new Date() });
  return {
    key,
    sizeBytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
};
