// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readUpdateSettings } from "../../infrastructure/update-settings/read-update-settings.js";
import { deriveUpdateRunState } from "../../domain/update/derive-update-run-state.js";
import type { SystemUpdateOverview, UpdateDependencies } from "../../types.js";
import { assertInstanceAdmin } from "./assert-instance-admin.js";

export const readUpdateOverview = async (
  deps: UpdateDependencies,
  userId: string,
): Promise<SystemUpdateOverview> => {
  await assertInstanceAdmin(deps.isInstanceAdmin, userId);
  const settings = await readUpdateSettings(deps.db);
  const { update, running } = await deps.updater.readStatus();
  return {
    currentVersion: deps.currentVersion,
    latestVersion: settings.latestVersion,
    updateAvailable: settings.updateAvailable ?? false,
    updateAllowed: settings.updateAllowed ?? false,
    checkedAt: settings.checkedAt?.toISOString() ?? null,
    runState: deriveUpdateRunState(update, running),
    lastRun: update,
    running,
    nightlyEnabled: settings.nightlyEnabled,
  };
};
