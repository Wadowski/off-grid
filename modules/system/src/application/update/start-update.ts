// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NoUpdateAvailableError } from "../errors/no-update-available-error.js";
import { UpdateAlreadyRunningError } from "../errors/update-already-running-error.js";
import { UpdateNotAllowedError } from "../errors/update-not-allowed-error.js";
import type { UpdateApplyResult, UpdateDependencies } from "../../types.js";
import { assertInstanceAdmin } from "./assert-instance-admin.js";
import { recordUpdateCheck } from "./record-update-check.js";

export const startUpdate = async (
  deps: UpdateDependencies,
  userId: string,
): Promise<UpdateApplyResult> => {
  await assertInstanceAdmin(deps.isInstanceAdmin, userId);
  const { running } = await deps.updater.readStatus();
  if (running) {
    throw new UpdateAlreadyRunningError();
  }
  const check = await recordUpdateCheck(deps);
  if (!check.updateAvailable) {
    throw new NoUpdateAvailableError();
  }
  if (!check.updateAllowed) {
    throw new UpdateNotAllowedError();
  }
  return deps.updater.applyUpdate(check.latestVersion);
};
