// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { join } from "node:path";
import { DUMP_FILE_NAME, SECRETS_FOLDER_NAME } from "../constants.js";
import type { BackupSettings, DatabaseTools } from "../types.js";
import { attemptBackupStep } from "./attempt-backup-step.js";
import { copySecrets } from "./copy-secrets.js";
import { verifyDump } from "./verify-dump.js";

export const writeBackupContents = async (
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
