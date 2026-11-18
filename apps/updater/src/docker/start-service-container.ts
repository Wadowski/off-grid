// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DockerContext } from "../types.js";
import { containerNameOf } from "./container-name-of.js";
import { originalNameOf } from "./original-name-of.js";
import { DockerStateError } from "./errors/docker-state-error.js";
import { findCurrentContainer } from "./find-current-container.js";
import { findReplacedContainer } from "./find-replaced-container.js";
import { inspectContainer } from "./inspect-container.js";
import { removeContainer } from "./remove-container.js";
import { renameContainer } from "./rename-container.js";
import { startContainer } from "./start-container.js";

export const startServiceContainer = async (
  context: DockerContext,
  service: string,
  previousImage: string,
): Promise<void> => {
  const current = await findCurrentContainer(context, service);
  if (
    current !== null &&
    (await inspectContainer(context.socketPath, current.Id)).Config.Image === previousImage
  ) {
    await startContainer(context.socketPath, current.Id);
    return;
  }
  const replaced = await findReplacedContainer(context, service);
  if (replaced === null) {
    throw new DockerStateError(`${service} previous container is missing`);
  }
  const name = originalNameOf(
    containerNameOf((await inspectContainer(context.socketPath, replaced.Id)).Name),
  );
  if (current !== null) {
    await removeContainer(context.socketPath, current.Id);
  }
  await renameContainer(context.socketPath, replaced.Id, name);
  await startContainer(context.socketPath, replaced.Id);
};
