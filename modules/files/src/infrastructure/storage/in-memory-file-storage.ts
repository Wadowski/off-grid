// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage, InMemoryObject } from "../../types.js";
import { hasInMemoryObject } from "./in-memory/has-in-memory-object.js";
import { listInMemoryObjects } from "./in-memory/list-in-memory-objects.js";
import { putInMemoryObject } from "./in-memory/put-in-memory-object.js";
import { readInMemoryObject } from "./in-memory/read-in-memory-object.js";
import { removeInMemoryObject } from "./in-memory/remove-in-memory-object.js";

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
