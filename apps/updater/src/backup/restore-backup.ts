// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RestoreFailedError } from "./errors/restore-failed-error.js";
import { restoreDatabase } from "./restore-database.js";
import type { DatabaseTools, RestoreSettings } from "../types.js";
import { waitForHealth } from "./wait-for-health.js";

export const restoreBackup = async (
  tools: DatabaseTools,
  settings: RestoreSettings,
  name: string,
): Promise<void> => {
  await restoreDatabase(tools, settings, name);
  const healthy = await waitForHealth(
    settings.healthProbe,
    settings.clock,
    settings.healthTimeoutMilliseconds,
  ).catch(() => false);
  if (!healthy) {
    throw new RestoreFailedError("health");
  }
};
