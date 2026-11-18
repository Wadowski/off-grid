// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ImageInspect } from "../types.js";
import { imageInspectSchema } from "./engine-schemas.js";
import { requestEngineJson } from "./request-engine-json.js";

export const inspectImage = async (socketPath: string, imageId: string): Promise<ImageInspect> =>
  imageInspectSchema.parse(
    await requestEngineJson(socketPath, "GET", `/images/${imageId}/json`, {
      operation: "inspect image",
    }),
  );
