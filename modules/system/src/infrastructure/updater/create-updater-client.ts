// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Fetcher, UpdaterClient, UpdaterSettings } from "../../types.js";
import { readUpdaterStatus } from "./read-updater-status.js";
import { requestUpdaterApply } from "./request-updater-apply.js";
import { requestUpdaterCheck } from "./request-updater-check.js";

export const createUpdaterClient = (
  settings: UpdaterSettings | null,
  fetcher: Fetcher = fetch,
): UpdaterClient => ({
  readStatus: () => readUpdaterStatus(settings, fetcher),
  checkForUpdate: () => requestUpdaterCheck(settings, fetcher),
  applyUpdate: (version) => requestUpdaterApply(settings, fetcher, version),
});
