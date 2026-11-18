// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { containerWaitSchema } from "./engine-schemas.js";
import { requestEngineJson } from "./request-engine-json.js";

export const waitContainer = async (socketPath: string, containerId: string): Promise<number> => {
  const body = containerWaitSchema.parse(
    await requestEngineJson(socketPath, "POST", `/containers/${containerId}/wait`, {
      operation: "wait for container",
    }),
  );
  return body.StatusCode;
};
