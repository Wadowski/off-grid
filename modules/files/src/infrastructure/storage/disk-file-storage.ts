// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage } from "../../types.js";
import { hasDiskObject } from "./disk/has-disk-object.js";
import { listDiskKeys } from "./disk/list-disk-keys.js";
import { putDiskObject } from "./disk/put-disk-object.js";
import { readDiskObject } from "./disk/read-disk-object.js";
import { removeDiskObject } from "./disk/remove-disk-object.js";

export const createDiskFileStorage = (directory: string): FileStorage => ({
  put: (source, options) => putDiskObject(directory, source, options),
  get: (key, range) => readDiskObject(directory, key, range),
  delete: (key) => removeDiskObject(directory, key),
  exists: (key) => hasDiskObject(directory, key),
  listKeys: () => listDiskKeys(directory),
});
