// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, rename } from "node:fs/promises";
import { dirname } from "node:path";
import { allocateStorageKey } from "../../../application/storage/allocate-storage-key.js";
import { hasDiskObject } from "./has-disk-object.js";
import { resolveKeyPath } from "./resolve-key-path.js";
import { toStorageIoError } from "./to-storage-io-error.js";

export const commitTempFile = async (directory: string, tempPath: string): Promise<string> => {
  const key = await allocateStorageKey((candidate) => hasDiskObject(directory, candidate));
  const finalPath = resolveKeyPath(directory, key);
  try {
    await mkdir(dirname(finalPath), { recursive: true });
    await rename(tempPath, finalPath);
  } catch (error) {
    throw toStorageIoError(error);
  }
  return key;
};
