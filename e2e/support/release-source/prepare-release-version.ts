// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RELEASE_SERVICES } from "./constants.js";
import { pushImage } from "./push-image.js";
import { resolveLocalImage } from "./resolve-local-image.js";
import { writeReleaseFiles } from "./write-release-files.js";
import type { PushedImages, ReleaseSourcePreparation, ReleaseVersionPlan } from "./types.js";

export const prepareReleaseVersion = async (
  preparation: ReleaseSourcePreparation,
  plan: ReleaseVersionPlan,
): Promise<void> => {
  const digests: Partial<PushedImages> = {};
  for (const service of RELEASE_SERVICES) {
    const localName = await resolveLocalImage(service, plan);
    digests[service] = await pushImage(service, localName, plan.version, preparation.registryPort);
  }
  await writeReleaseFiles(
    preparation.directory,
    plan.version,
    digests as PushedImages,
    preparation.registryPort,
  );
};
