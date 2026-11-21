// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SERVER_IMAGE_REFERENCE_PATTERN, WEB_IMAGE_REFERENCE_PATTERN } from "@offgrid/contracts";
import type { DockerContext, ImageReferences } from "../types.js";
import { DockerStateError } from "./errors/docker-state-error.js";
import { findCurrentContainer } from "./find-current-container.js";
import { inspectContainer } from "./inspect-container.js";
import { inspectImage } from "./inspect-image.js";
import { manifestImageReference } from "./manifest-image-reference.js";
import { registryDigestFor } from "./registry-digest-for.js";

export const inspectRunningImages = async (context: DockerContext): Promise<ImageReferences> => ({
  server: await runningDigestOf(context, "server", SERVER_IMAGE_REFERENCE_PATTERN),
  web: await runningDigestOf(context, "web", WEB_IMAGE_REFERENCE_PATTERN),
});

const runningDigestOf = async (
  context: DockerContext,
  service: string,
  referencePattern: RegExp,
): Promise<string> => {
  const container = await findCurrentContainer(context, service);
  if (container === null) {
    throw new DockerStateError(`${service} container is missing`);
  }
  const image = await inspectImage(
    context.socketPath,
    (await inspectContainer(context.socketPath, container.Id)).Image,
  );
  const digest = registryDigestFor(
    (image.RepoDigests ?? []).map((reference) => manifestImageReference(context, reference)),
    referencePattern,
  );
  if (digest === null) {
    throw new DockerStateError(`${service} image has no registry digest`);
  }
  return digest;
};
