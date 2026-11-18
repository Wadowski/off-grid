// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFile } from "node:fs/promises";
import { isMissingDirectoryError } from "../backup/is-missing-directory-error.js";

export const readStatusFileText = async (statusFile: string): Promise<string | null> => {
  try {
    return await readFile(statusFile, "utf8");
  } catch (error) {
    if (isMissingDirectoryError(error)) {
      return null;
    }
    throw error;
  }
};
