// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { BACKUP_FOLDER } from "./constants.js";
import { runUpdaterCommand } from "./run-updater-command.js";

export const breakBackups = async (): Promise<void> => {
  await runUpdaterCommand(["chmod", "000", BACKUP_FOLDER]);
};
