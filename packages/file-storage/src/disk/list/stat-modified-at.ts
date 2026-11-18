// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { stat } from "node:fs/promises";
import { isMissingFileError } from "../errors/is-missing-file-error.js";
import { toStorageIoError } from "../errors/to-storage-io-error.js";

export const statModifiedAt = async (path: string): Promise<Date | undefined> => {
  try {
    return (await stat(path)).mtime;
  } catch (error) {
    if (isMissingFileError(error)) {
      return undefined;
    }
    throw toStorageIoError(error);
  }
};
