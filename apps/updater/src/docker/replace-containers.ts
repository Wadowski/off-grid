// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DOCKER_SERVICE_NAMES } from "../constants.js";
import type { DockerContext, ImageReferences } from "../types.js";
import { replaceServiceContainer } from "./replace-service-container.js";

export const replaceContainers = async (
  context: DockerContext,
  images: ImageReferences,
): Promise<void> => {
  for (const service of DOCKER_SERVICE_NAMES) {
    await replaceServiceContainer(context, service, images[service]);
  }
};
