// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { compareReleaseVersions } from "@offgrid/contracts";
import { GOOD_RELEASE_VERSIONS } from "../release-source/constants.js";

export const newerGoodVersion = (runningVersion: string): string => {
  const newer = GOOD_RELEASE_VERSIONS.find(
    (version) => compareReleaseVersions(version, runningVersion) > 0,
  );
  if (newer === undefined) {
    throw new Error(`No prepared release is newer than ${runningVersion}.`);
  }
  return newer;
};
