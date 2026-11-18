// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readdir } from "node:fs/promises";
import { isMissingFileError } from "./is-missing-file-error.js";
import { toStorageIoError } from "./to-storage-io-error.js";

export const listEntryNames = async (
  path: string,
  kind: "directory" | "file",
  accept: (name: string) => boolean,
): Promise<string[]> => {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries
      .filter((entry) => (kind === "directory" ? entry.isDirectory() : entry.isFile()))
      .map((entry) => entry.name)
      .filter(accept)
      .sort();
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }
    throw toStorageIoError(error);
  }
};
