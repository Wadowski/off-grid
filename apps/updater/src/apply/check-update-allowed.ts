// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { compareReleaseVersions } from "@offgrid/contracts";
import type { ParsedApplyRequest } from "../types.js";
import { UpdateRefusedError } from "./errors/update-refused-error.js";

export const checkUpdateAllowed = (request: ParsedApplyRequest): void => {
  if (compareReleaseVersions(request.currentVersion, request.manifest.minimumPreviousVersion) < 0) {
    throw new UpdateRefusedError("current version is below the minimum previous version");
  }
  if (compareReleaseVersions(request.manifest.version, request.currentVersion) <= 0) {
    throw new UpdateRefusedError("target version is not newer than the current version");
  }
};
