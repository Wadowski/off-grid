// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage, InMemoryObject } from "../types.js";
import { hasInMemoryObject } from "./has-in-memory-object.js";
import { listInMemoryObjects } from "./list-in-memory-objects.js";
import { putInMemoryObject } from "./put-in-memory-object.js";
import { readInMemoryObject } from "./read-in-memory-object.js";
import { removeInMemoryObject } from "./remove-in-memory-object.js";

export const createInMemoryFileStorage = (): FileStorage => {
  const objects = new Map<string, InMemoryObject>();
  return {
    put: (source, options) => putInMemoryObject(objects, source, options),
    get: (key, range) => readInMemoryObject(objects, key, range),
    delete: (key) => removeInMemoryObject(objects, key),
    exists: (key) => hasInMemoryObject(objects, key),
    listKeys: () => listInMemoryObjects(objects),
  };
};
