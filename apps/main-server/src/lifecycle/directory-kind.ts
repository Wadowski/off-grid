// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { stat } from "node:fs/promises";
import type { DirectoryKind } from "../types.js";

export const directoryKindOf = async (path: string): Promise<DirectoryKind> => {
  try {
    const entry = await stat(path);
    return entry.isDirectory() ? "directory" : "other";
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "ENOENT" || error.code === "ENOTDIR")
    ) {
      return "missing";
    }
    throw error;
  }
};
