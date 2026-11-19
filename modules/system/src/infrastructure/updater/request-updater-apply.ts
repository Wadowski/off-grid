// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { systemUpdateApplyResultSchema } from "@offgrid/contracts";
import type { Fetcher, UpdateApplyResult, UpdaterSettings } from "../../types.js";
import { callUpdater } from "./call-updater.js";

export const requestUpdaterApply = (
  settings: UpdaterSettings | null,
  fetcher: Fetcher,
  version: string,
): Promise<UpdateApplyResult> =>
  callUpdater(
    settings,
    fetcher,
    { method: "POST", path: "/apply", body: { version } },
    systemUpdateApplyResultSchema,
  );
