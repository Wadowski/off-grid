// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { stat } from "node:fs/promises";
import { resolveKeyPath } from "./resolve-key-path.js";
import { isMissingFileError } from "./is-missing-file-error.js";
import { toStorageIoError } from "./to-storage-io-error.js";

export const hasDiskObject = async (directory: string, key: string): Promise<boolean> => {
  try {
    await stat(resolveKeyPath(directory, key));
    return true;
  } catch (error) {
    if (isMissingFileError(error)) {
      return false;
    }
    throw toStorageIoError(error);
  }
};
