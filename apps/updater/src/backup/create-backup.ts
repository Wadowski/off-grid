// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { rm } from "node:fs/promises";
import { join } from "node:path";
import { DUMP_FILE_NAME, SECRETS_FOLDER_NAME } from "../constants.js";
import type { BackupDescriptor, BackupRequest, BackupSettings, DatabaseTools } from "../types.js";
import { attemptBackupStep } from "./attempt-backup-step.js";
import { buildBackupName } from "./build-backup-name.js";
import { copySecrets } from "./copy-secrets.js";
import { prepareBackupFolder } from "./prepare-backup-folder.js";
import { pruneBackups } from "./prune-backups.js";
import { verifyDump } from "./verify-dump.js";

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
    await rm(folder, { recursive: true, force: true });
    throw error;
  }
  await attemptBackupStep("prune", () =>
    pruneBackups(settings.backupRoot, settings.retention, name),
  );
  return { name, version: request.version, createdAt: request.createdAt, path: folder };
};

const writeBackupContents = async (
  tools: DatabaseTools,
  settings: BackupSettings,
  folder: string,
): Promise<void> => {
  const dumpFile = join(folder, DUMP_FILE_NAME);
  await attemptBackupStep("dump", () => tools.dump(settings.target, dumpFile));
  await attemptBackupStep("verify", () => verifyDump(tools, dumpFile));
  await attemptBackupStep("copy-secrets", () =>
    copySecrets(settings.secretsDirectory, join(folder, SECRETS_FOLDER_NAME)),
  );
};
