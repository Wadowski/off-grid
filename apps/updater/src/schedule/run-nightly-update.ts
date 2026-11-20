// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NightlyRunResult, ReadNightlySetting, UpdaterServices } from "../types.js";
import { checkAndApplyNightlyUpdate } from "./check-and-apply-nightly-update.js";

export const runNightlyUpdate = async (
  services: UpdaterServices,
  readNightlySetting: ReadNightlySetting,
): Promise<NightlyRunResult> => {
  const release = services.runLock.tryAcquire();
  if (release === null) {
    services.logger.info("nightly update skipped, an update is already running");
    return "run_in_progress";
  }
  try {
    return await checkAndApplyNightlyUpdate(services, readNightlySetting);
  } finally {
    release();
  }
};
