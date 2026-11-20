// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import type { UpdateErrorTextId } from "./types.js";

export const describeUpdateError = (error: unknown): UpdateErrorTextId => {
  if (!(error instanceof ApiError)) {
    return "admin.update.errors.generic";
  }
  switch (error.code) {
    case "NO_UPDATE_AVAILABLE":
      return "admin.update.errors.noUpdateAvailable";
    case "UPDATE_NOT_ALLOWED":
      return "admin.update.errors.updateNotAllowed";
    case "UPDATE_ALREADY_RUNNING":
      return "admin.update.errors.alreadyRunning";
    case "UPDATER_UNAVAILABLE":
      return "admin.update.errors.updaterUnavailable";
    case "RELEASE_SOURCE_UNREACHABLE":
      return "admin.update.errors.releaseSourceUnreachable";
    case "CURRENT_VERSION_UNKNOWN":
      return "admin.update.errors.currentVersionUnknown";
    default:
      return "admin.update.errors.generic";
  }
};
