// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { STACK_VERSION } from "./constants.js";
import { buildDerivedImage } from "./build-derived-image.js";
import { stackImageName } from "./local-image-name.js";
import { retagUpdaterImage } from "./retag-updater-image.js";
import type { ReleaseService, ReleaseVersionPlan } from "./types.js";

export const resolveLocalImage = async (
  service: ReleaseService,
  plan: ReleaseVersionPlan,
): Promise<string> => {
  if (plan.version === STACK_VERSION) {
    return stackImageName(service);
  }
  return service === "updater" ? retagUpdaterImage(plan.version) : buildDerivedImage(service, plan);
};
