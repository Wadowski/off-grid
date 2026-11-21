// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  FAILING_RELEASE_VERSION,
  GOOD_RELEASE_VERSIONS,
  LATEST_VERSION_FILE,
  STACK_VERSION,
} from "./constants.js";
import { prepareReleaseVersion } from "./prepare-release-version.js";
import type { ReleaseSourcePreparation, ReleaseVersionPlan } from "./types.js";

const releasePlans = (): ReleaseVersionPlan[] => [
  { version: STACK_VERSION, failsHealthCheck: false },
  ...GOOD_RELEASE_VERSIONS.map((version) => ({ version, failsHealthCheck: false })),
  { version: FAILING_RELEASE_VERSION, failsHealthCheck: true },
];

export const prepareReleaseSource = async (
  preparation: ReleaseSourcePreparation,
): Promise<void> => {
  await mkdir(preparation.directory, { recursive: true });
  for (const plan of releasePlans()) {
    await prepareReleaseVersion(preparation, plan);
  }
  await writeFile(
    join(preparation.directory, LATEST_VERSION_FILE),
    GOOD_RELEASE_VERSIONS[0] ?? STACK_VERSION,
  );
};
