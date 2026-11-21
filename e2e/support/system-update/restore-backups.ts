// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { BACKUP_FOLDER } from "./constants.js";
import { runUpdaterCommand } from "./run-updater-command.js";

export const restoreBackups = async (): Promise<void> => {
  await runUpdaterCommand(["chmod", "700", BACKUP_FOLDER]);
};
