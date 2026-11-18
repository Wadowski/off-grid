// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ContainerInspect } from "../types.js";
import { containerInspectSchema } from "./engine-schemas.js";
import { requestEngineJson } from "./request-engine-json.js";

export const inspectContainer = async (
  socketPath: string,
  containerId: string,
): Promise<ContainerInspect> =>
  containerInspectSchema.parse(
    await requestEngineJson(socketPath, "GET", `/containers/${containerId}/json`, {
      operation: "inspect container",
    }),
  );
