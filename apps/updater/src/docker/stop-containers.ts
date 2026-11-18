// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DOCKER_SERVICE_NAMES } from "../constants.js";
import type { DockerContext } from "../types.js";
import { DockerStateError } from "./errors/docker-state-error.js";
import { findCurrentContainer } from "./find-current-container.js";
import { stopContainer } from "./stop-container.js";

export const stopContainers = async (context: DockerContext): Promise<void> => {
  for (const service of DOCKER_SERVICE_NAMES) {
    const current = await findCurrentContainer(context, service);
    if (current === null) {
      throw new DockerStateError(`${service} container is missing`);
    }
    await stopContainer(context.socketPath, current.Id);
  }
};
