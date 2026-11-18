// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage } from "../../types.js";
import { hasInMemoryObject } from "./in-memory/has-in-memory-object.js";
import { putInMemoryObject } from "./in-memory/put-in-memory-object.js";
import { readInMemoryObject } from "./in-memory/read-in-memory-object.js";
import { removeInMemoryObject } from "./in-memory/remove-in-memory-object.js";

export const createInMemoryFileStorage = (): FileStorage => {
  const objects = new Map<string, Buffer>();
  return {
    put: (source, options) => putInMemoryObject(objects, source, options),
    get: (key, range) => readInMemoryObject(objects, key, range),
    delete: (key) => removeInMemoryObject(objects, key),
    exists: (key) => hasInMemoryObject(objects, key),
  };
};
