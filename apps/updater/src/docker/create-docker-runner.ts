// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DockerContext, DockerRunner } from "../types.js";
import { inspectRunningImages } from "./inspect-running-images.js";
import { pullImageReference } from "./pull-image-reference.js";
import { replaceContainers } from "./replace-containers.js";
import { runInitJob } from "./run-init-job.js";
import { startContainers } from "./start-containers.js";
import { stopContainers } from "./stop-containers.js";

export const createDockerRunner = (context: DockerContext): DockerRunner => ({
  inspectRunningImages: () => inspectRunningImages(context),
  pullImage: (reference) => pullImageReference(context.socketPath, reference),
  runInitJob: (serverImage) => runInitJob(context, serverImage),
  replaceContainers: (images) => replaceContainers(context, images),
  stopContainers: () => stopContainers(context),
  startContainers: (images) => startContainers(context, images),
});
