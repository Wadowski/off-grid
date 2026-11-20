// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { checkForUpdate } from "../release/check-for-update.js";
import { loadReleaseContext } from "../release/load-release-context.js";
import type { NightlyRunResult, ReadNightlySetting, UpdaterServices } from "../types.js";
import { applyNightlyUpdate } from "./apply-nightly-update.js";

export const checkAndApplyNightlyUpdate = async (
  services: UpdaterServices,
  readNightlySetting: ReadNightlySetting,
): Promise<NightlyRunResult> => {
  const enabled = await readNightlySetting().catch(() => null);
  if (enabled === null) {
    services.logger.warn("nightly setting could not be read, nightly update skipped");
    return "setting_unreadable";
  }
  if (!enabled) {
    services.logger.debug("nightly update is off");
    return "disabled";
  }
  const context = await loadReleaseContext(services, null);
  if (!context.ok) {
    return "release_unavailable";
  }
  const check = checkForUpdate(context.currentVersion, context.manifest);
  if (!check.updateAvailable) {
    services.logger.info("nightly update found no newer release");
    return "no_update";
  }
  if (!check.updateAllowed) {
    services.logger.warn(
      "nightly update skipped, the running version cannot update to the release",
    );
    return "update_not_allowed";
  }
  return applyNightlyUpdate(services, context);
};
