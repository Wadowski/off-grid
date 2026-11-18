// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { rm } from "node:fs/promises";
import { join } from "node:path";
import { listBackups } from "./list-backups.js";
import { selectBackupsToPrune } from "./select-backups-to-prune.js";

export const pruneBackups = async (
  backupRoot: string,
  retention: number,
  keptName: string,
): Promise<void> => {
  const backups = await listBackups(backupRoot);
  for (const backup of selectBackupsToPrune(backups, retention, keptName)) {
    await rm(join(backupRoot, backup.name), { recursive: true, force: true });
  }
};
