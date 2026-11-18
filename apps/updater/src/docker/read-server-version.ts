// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RELEASE_VERSION_PATTERN } from "@offgrid/contracts";
import { SERVER_VERSION_LABEL } from "../constants.js";
import type { DockerContext } from "../types.js";
import { DockerStateError } from "./errors/docker-state-error.js";
import { findCurrentContainer } from "./find-current-container.js";
import { inspectContainer } from "./inspect-container.js";
import { inspectImage } from "./inspect-image.js";

export const readServerVersion = async (context: DockerContext): Promise<string> => {
  const container = await findCurrentContainer(context, "server");
  if (container === null) {
    throw new DockerStateError("server container is missing");
  }
  const source = await inspectContainer(context.socketPath, container.Id);
  const image = await inspectImage(context.socketPath, source.Image);
  const version = image.Config.Labels?.[SERVER_VERSION_LABEL];
  if (version === undefined || !RELEASE_VERSION_PATTERN.test(version)) {
    throw new DockerStateError("server image has no release version label");
  }
  return version;
};
