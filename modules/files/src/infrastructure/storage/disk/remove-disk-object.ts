// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { rm } from "node:fs/promises";
import { resolveKeyPath } from "./resolve-key-path.js";
import { toStorageIoError } from "./to-storage-io-error.js";

export const removeDiskObject = async (directory: string, key: string): Promise<void> => {
  try {
    await rm(resolveKeyPath(directory, key), { force: true });
  } catch (error) {
    throw toStorageIoError(error);
  }
};
