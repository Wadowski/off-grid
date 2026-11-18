// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isAbsolute, relative } from "node:path";
import { StorageKeyInvalidError } from "../../errors/storage-key-invalid-error.js";

export const assertPathInsideDirectory = (directory: string, path: string): void => {
  const offset = relative(directory, path);
  if (offset === "" || offset.startsWith("..") || isAbsolute(offset)) {
    throw new StorageKeyInvalidError();
  }
};
