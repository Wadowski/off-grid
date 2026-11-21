// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { STACK_VERSION } from "./constants.js";
import { dockerGroupId } from "./docker-group-id.js";
import { registryPort } from "./registry-port.js";
import { releaseSourcePort } from "./release-source-port.js";

export const stackEnvironment = (project: string): Record<string, string> => ({
  OFFGRID_VERSION: STACK_VERSION,
  OFFGRID_DOCKER_GID: dockerGroupId(),
  E2E_COMPOSE_PROJECT: project,
  E2E_REGISTRY_PORT: registryPort(),
  E2E_RELEASE_SOURCE_PORT: releaseSourcePort(),
});
