// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EngineRequestOptions } from "../types.js";
import { DockerApiError } from "./errors/docker-api-error.js";
import { sendEngineRequest } from "./send-engine-request.js";

const SUCCESS_STATUS_MIN = 200;
const SUCCESS_STATUS_MAX = 299;

export const requestEngineJson = async (
  socketPath: string,
  method: string,
  path: string,
  options: EngineRequestOptions,
): Promise<unknown> => {
  const response = await sendEngineRequest(socketPath, method, path, options.body);
  const accepted =
    (response.status >= SUCCESS_STATUS_MIN && response.status <= SUCCESS_STATUS_MAX) ||
    (options.acceptedStatuses ?? []).includes(response.status);
  if (!accepted) {
    throw new DockerApiError(options.operation, response.status);
  }
  return response.text.length === 0 ? null : JSON.parse(response.text);
};
