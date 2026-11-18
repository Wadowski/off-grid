// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readdir } from "node:fs/promises";
import type { ParsedBackupName } from "../types.js";
import { parseBackupName } from "./parse-backup-name.js";

export const listBackups = async (backupRoot: string): Promise<ParsedBackupName[]> => {
  const entries = await readdir(backupRoot, { withFileTypes: true }).catch((error: unknown) => {
    if (isMissingDirectoryError(error)) {
      return [];
    }
    throw error;
  });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => parseBackupName(entry.name))
    .filter((backup): backup is ParsedBackupName => backup !== undefined);
};

const isMissingDirectoryError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
