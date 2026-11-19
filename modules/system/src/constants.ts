// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateErrorCode, UpdateErrorResponse } from "./types.js";

export const SYSTEM_MODULE_NAME = "system";

export const UPDATER_REQUEST_TIMEOUT_MS = 10_000;

export const UPDATE_SETTINGS_KEY = "instance";

export const UPDATE_ERROR_RESPONSES: Record<
  Exclude<UpdateErrorCode, "ACCESS_DENIED">,
  UpdateErrorResponse
> = {
  UPDATER_UNAVAILABLE: { status: 503, message: "The update service is not reachable" },
  UPDATER_ERROR: { status: 502, message: "The update service returned an error" },
  RELEASE_SOURCE_UNREACHABLE: { status: 502, message: "The release source is not reachable" },
  CURRENT_VERSION_UNKNOWN: {
    status: 409,
    message: "The running version is not a release, so updates are not available",
  },
  UPDATE_ALREADY_RUNNING: { status: 409, message: "An update is already running" },
  NO_UPDATE_AVAILABLE: { status: 409, message: "No newer release is available" },
  UPDATE_NOT_ALLOWED: { status: 409, message: "This version cannot update to the latest release" },
};
