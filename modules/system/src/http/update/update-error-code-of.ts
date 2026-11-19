// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { AdminRequiredError } from "../../application/errors/admin-required-error.js";
import { CurrentVersionUnknownError } from "../../application/errors/current-version-unknown-error.js";
import { NoUpdateAvailableError } from "../../application/errors/no-update-available-error.js";
import { UpdateAlreadyRunningError } from "../../application/errors/update-already-running-error.js";
import { UpdateNotAllowedError } from "../../application/errors/update-not-allowed-error.js";
import { UpdaterFailedError } from "../../application/errors/updater-failed-error.js";
import { UpdaterUnavailableError } from "../../application/errors/updater-unavailable-error.js";
import type { UpdateErrorCode } from "../../types.js";

export const updateErrorCodeOf = (error: unknown): UpdateErrorCode | null => {
  if (error instanceof AdminRequiredError) {
    return "ACCESS_DENIED";
  }
  if (error instanceof UpdaterUnavailableError) {
    return "UPDATER_UNAVAILABLE";
  }
  if (error instanceof UpdaterFailedError) {
    return error.code;
  }
  if (error instanceof CurrentVersionUnknownError) {
    return "CURRENT_VERSION_UNKNOWN";
  }
  if (error instanceof UpdateAlreadyRunningError) {
    return "UPDATE_ALREADY_RUNNING";
  }
  if (error instanceof NoUpdateAvailableError) {
    return "NO_UPDATE_AVAILABLE";
  }
  if (error instanceof UpdateNotAllowedError) {
    return "UPDATE_NOT_ALLOWED";
  }
  return null;
};
