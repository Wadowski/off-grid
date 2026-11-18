// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { compareReleaseVersions } from "@offgrid/contracts";
import type { ReleaseManifest, UpdateCheck } from "../types.js";

export const checkForUpdate = (currentVersion: string, manifest: ReleaseManifest): UpdateCheck => ({
  currentVersion,
  latestVersion: manifest.version,
  updateAvailable: compareReleaseVersions(manifest.version, currentVersion) > 0,
  updateAllowed: compareReleaseVersions(currentVersion, manifest.minimumPreviousVersion) >= 0,
});
