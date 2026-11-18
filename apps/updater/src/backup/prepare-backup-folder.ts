// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir } from "node:fs/promises";
import { BACKUP_FOLDER_MODE } from "../constants.js";

export const prepareBackupFolder = async (backupRoot: string, folder: string): Promise<void> => {
  await mkdir(backupRoot, { recursive: true, mode: BACKUP_FOLDER_MODE });
  await mkdir(folder, { mode: BACKUP_FOLDER_MODE });
};
