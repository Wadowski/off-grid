// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DOCKER_SERVICE_NAMES } from "../constants.js";
import type { DockerContext, ImageReferences } from "../types.js";
import { startServiceContainer } from "./start-service-container.js";

export const startContainers = async (
  context: DockerContext,
  previousImages: ImageReferences,
): Promise<void> => {
  for (const service of DOCKER_SERVICE_NAMES) {
    await startServiceContainer(context, service, previousImages[service]);
  }
};
