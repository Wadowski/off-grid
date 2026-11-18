// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage } from "../types.js";
import { hasDiskObject } from "./has-disk-object.js";
import { listDiskKeys } from "./list/list-disk-keys.js";
import { putDiskObject } from "./put/put-disk-object.js";
import { readDiskObject } from "./read-disk-object.js";
import { removeDiskObject } from "./remove-disk-object.js";

export const createDiskFileStorage = (directory: string): FileStorage => ({
  put: (source, options) => putDiskObject(directory, source, options),
  get: (key, range) => readDiskObject(directory, key, range),
  delete: (key) => removeDiskObject(directory, key),
  exists: (key) => hasDiskObject(directory, key),
  listKeys: () => listDiskKeys(directory),
});
