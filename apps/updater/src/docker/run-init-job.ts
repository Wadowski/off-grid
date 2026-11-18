// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { INIT_SERVICE_NAME } from "../constants.js";
import type { DockerContext } from "../types.js";
import { createContainerFrom } from "./create-container-from.js";
import { DockerStateError } from "./errors/docker-state-error.js";
import { findCurrentContainer } from "./find-current-container.js";
import { inspectContainer } from "./inspect-container.js";
import { removeContainer } from "./remove-container.js";
import { startContainer } from "./start-container.js";
import { waitContainer } from "./wait-container.js";

export const runInitJob = async (context: DockerContext, serverImage: string): Promise<void> => {
  const initContainer = await findCurrentContainer(context, INIT_SERVICE_NAME);
  if (initContainer === null) {
    throw new DockerStateError("init container is missing");
  }
  const source = await inspectContainer(context.socketPath, initContainer.Id);
  const jobName = `${context.project}-${INIT_SERVICE_NAME}-update`;
  await removeContainer(context.socketPath, jobName);
  const jobId = await createContainerFrom(context.socketPath, source, serverImage, jobName);
  await startContainer(context.socketPath, jobId);
  const exitCode = await waitContainer(context.socketPath, jobId);
  await removeContainer(context.socketPath, jobId);
  if (exitCode !== 0) {
    throw new DockerStateError("init job exited with a failure");
  }
};
