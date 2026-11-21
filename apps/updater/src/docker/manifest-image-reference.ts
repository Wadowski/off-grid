// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MANIFEST_IMAGE_REGISTRY } from "../constants.js";
import type { DockerContext } from "../types.js";

export const manifestImageReference = (context: DockerContext, localReference: string): string =>
  context.imageRegistry !== null && localReference.startsWith(`${context.imageRegistry}/`)
    ? `${MANIFEST_IMAGE_REGISTRY}/${localReference.slice(context.imageRegistry.length + 1)}`
    : localReference;
