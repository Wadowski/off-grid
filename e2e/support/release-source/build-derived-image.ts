// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { derivedDockerfile } from "./derived-dockerfile.js";
import { localImageName } from "./local-image-name.js";
import { runDocker } from "./run-docker.js";
import type { ReleaseService, ReleaseVersionPlan } from "./types.js";

export const buildDerivedImage = async (
  service: ReleaseService,
  plan: ReleaseVersionPlan,
): Promise<string> => {
  const name = localImageName(service, plan.version);
  await runDocker(["build", "--quiet", "--tag", name, "-"], derivedDockerfile(service, plan));
  return name;
};
