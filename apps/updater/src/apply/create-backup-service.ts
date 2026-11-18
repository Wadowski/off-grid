// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBackup } from "../backup/create-backup.js";
import { restoreDatabase } from "../backup/restore-database.js";
import type { BackupService, BackupSettings, Clock, DatabaseTools } from "../types.js";

export const createBackupService = (
  tools: DatabaseTools,
  settings: BackupSettings,
  clock: Clock,
): BackupService => ({
  create: async (version) => {
    const backup = await createBackup(tools, settings, {
      version,
      createdAt: new Date(clock.now()),
    });
    return { name: backup.name };
  },
  restore: (name) => restoreDatabase(tools, settings, name),
});
