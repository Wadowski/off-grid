// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { rm } from "node:fs/promises";
import { join } from "node:path";
import type { BackupDescriptor, BackupRequest, BackupSettings, DatabaseTools } from "../types.js";
import { attemptBackupStep } from "./attempt-backup-step.js";
import { buildBackupName } from "./build-backup-name.js";
import { prepareBackupFolder } from "./prepare-backup-folder.js";
import { pruneBackups } from "./prune-backups.js";
import { writeBackupContents } from "./write-backup-contents.js";

const PRUNE_WARNING = "older backups could not be pruned; the new backup is kept";

export const createBackup = async (
  tools: DatabaseTools,
  settings: BackupSettings,
  request: BackupRequest,
): Promise<BackupDescriptor> => {
  const name = buildBackupName(request.version, request.createdAt);
  const folder = join(settings.backupRoot, name);
  await attemptBackupStep("prepare", () => prepareBackupFolder(settings.backupRoot, folder));
  try {
    await writeBackupContents(tools, settings, folder);
  } catch (error) {
    await rm(folder, { recursive: true, force: true }).catch(() => undefined);
    throw error;
  }
  const pruned = await pruneBackups(settings.backupRoot, settings.retention, name).then(
    () => true,
    () => false,
  );
  return {
    name,
    version: request.version,
    createdAt: request.createdAt,
    path: folder,
    ...(pruned ? {} : { pruneWarning: PRUNE_WARNING }),
  };
};
