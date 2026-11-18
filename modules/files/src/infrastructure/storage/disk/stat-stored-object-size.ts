// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { stat } from "node:fs/promises";
import { StorageObjectNotFoundError } from "../../../application/errors/storage-object-not-found-error.js";
import { isMissingFileError } from "./is-missing-file-error.js";
import { toStorageIoError } from "./to-storage-io-error.js";

export const statStoredObjectSize = async (path: string): Promise<number> => {
  try {
    return (await stat(path)).size;
  } catch (error) {
    if (isMissingFileError(error)) {
      throw new StorageObjectNotFoundError();
    }
    throw toStorageIoError(error);
  }
};
