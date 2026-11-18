// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { attemptRestoreStep } from "./attempt-restore-step.js";
import { locateDumpFile } from "./locate-dump-file.js";
import type { DatabaseTools, RestoreSettings } from "../types.js";

export const restoreDatabase = async (
  tools: DatabaseTools,
  settings: Pick<RestoreSettings, "target" | "backupRoot">,
  name: string,
): Promise<void> => {
  const dumpFile = await locateDumpFile(settings.backupRoot, name);
  await attemptRestoreStep("restore", () => tools.restore(settings.target, dumpFile));
};
