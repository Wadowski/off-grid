// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DockerContext, ImageReferences } from "../types.js";
import { localImageReference } from "./local-image-reference.js";

export const localImageReferences = (
  context: DockerContext,
  images: ImageReferences,
): ImageReferences => ({
  server: localImageReference(context, images.server),
  web: localImageReference(context, images.web),
});
