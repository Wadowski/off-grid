// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { stat } from "node:fs/promises";

export type DirectoryKind = "missing" | "directory" | "other";

export const directoryKindOf = async (path: string): Promise<DirectoryKind> => {
  try {
    const entry = await stat(path);
    return entry.isDirectory() ? "directory" : "other";
  } catch {
    return "missing";
  }
};
