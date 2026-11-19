// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { updaterCheckSchema } from "@offgrid/contracts";
import type { Fetcher, UpdaterCheck, UpdaterSettings } from "../../types.js";
import { callUpdater } from "./call-updater.js";

export const requestUpdaterCheck = (
  settings: UpdaterSettings | null,
  fetcher: Fetcher,
): Promise<UpdaterCheck> =>
  callUpdater(settings, fetcher, { method: "POST", path: "/check" }, updaterCheckSchema);
