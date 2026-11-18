// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Readable } from "node:stream";
import type { InMemoryObject, StoredObjectEntry } from "../types.js";

export const listInMemoryObjects = (objects: Map<string, InMemoryObject>): Readable => {
  const entries: StoredObjectEntry[] = Array.from(objects, ([key, object]) => ({
    key,
    modifiedAt: object.modifiedAt,
  }));
  return Readable.from(entries);
};
