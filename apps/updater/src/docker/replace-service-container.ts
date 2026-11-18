// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DockerContext } from "../types.js";
import { containerNameOf } from "./container-name-of.js";
import { createContainerFrom } from "./create-container-from.js";
import { DockerStateError } from "./errors/docker-state-error.js";
import { findCurrentContainer } from "./find-current-container.js";
import { inspectContainer } from "./inspect-container.js";
import { removeContainer } from "./remove-container.js";
import { renameContainer } from "./rename-container.js";
import { startContainer } from "./start-container.js";
import { stopContainer } from "./stop-container.js";
import { REPLACED_CONTAINER_SUFFIX } from "../constants.js";

export const replaceServiceContainer = async (
  context: DockerContext,
  service: string,
  image: string,
): Promise<void> => {
  const current = await findCurrentContainer(context, service);
  if (current === null) {
    throw new DockerStateError(`${service} container is missing`);
  }
  const source = await inspectContainer(context.socketPath, current.Id);
  const name = containerNameOf(source.Name);
  const replacedName = `${name}${REPLACED_CONTAINER_SUFFIX}`;
  await stopContainer(context.socketPath, current.Id);
  await removeContainer(context.socketPath, replacedName);
  await renameContainer(context.socketPath, current.Id, replacedName);
  const replacementId = await createContainerFrom(context.socketPath, source, image, name);
  await startContainer(context.socketPath, replacementId);
};
