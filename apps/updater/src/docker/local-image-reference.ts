// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MANIFEST_IMAGE_REGISTRY } from "../constants.js";
import type { DockerContext } from "../types.js";

export const localImageReference = (context: DockerContext, manifestReference: string): string =>
  context.imageRegistry !== null && manifestReference.startsWith(`${MANIFEST_IMAGE_REGISTRY}/`)
    ? `${context.imageRegistry}/${manifestReference.slice(MANIFEST_IMAGE_REGISTRY.length + 1)}`
    : manifestReference;
