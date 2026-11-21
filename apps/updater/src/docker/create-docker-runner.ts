// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DockerContext, DockerRunner, ImageReferences } from "../types.js";
import { inspectRunningImages } from "./inspect-running-images.js";
import { localImageReference } from "./local-image-reference.js";
import { pullImageReference } from "./pull-image-reference.js";
import { replaceContainers } from "./replace-containers.js";
import { runInitJob } from "./run-init-job.js";
import { startContainers } from "./start-containers.js";
import { stopContainers } from "./stop-containers.js";

export const createDockerRunner = (context: DockerContext): DockerRunner => {
  const localImages = (images: ImageReferences): ImageReferences => ({
    server: localImageReference(context, images.server),
    web: localImageReference(context, images.web),
  });
  return {
    inspectRunningImages: () => inspectRunningImages(context),
    pullImage: (reference) =>
      pullImageReference(context.socketPath, localImageReference(context, reference)),
    runInitJob: (serverImage) => runInitJob(context, localImageReference(context, serverImage)),
    replaceContainers: (images) => replaceContainers(context, localImages(images)),
    stopContainers: () => stopContainers(context),
    startContainers: (images) => startContainers(context, localImages(images)),
  };
};
