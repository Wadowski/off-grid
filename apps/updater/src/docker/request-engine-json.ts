// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EngineRequestOptions } from "../types.js";
import { DOCKER_SUCCESS_STATUS_MAX, DOCKER_SUCCESS_STATUS_MIN } from "../constants.js";
import { DockerApiError } from "./errors/docker-api-error.js";
import { sendEngineRequest } from "./send-engine-request.js";

export const requestEngineJson = async (
  socketPath: string,
  method: string,
  path: string,
  options: EngineRequestOptions,
): Promise<unknown> => {
  const response = await sendEngineRequest(socketPath, method, path, options.body);
  const accepted =
    (response.status >= DOCKER_SUCCESS_STATUS_MIN &&
      response.status <= DOCKER_SUCCESS_STATUS_MAX) ||
    (options.acceptedStatuses ?? []).includes(response.status);
  if (!accepted) {
    throw new DockerApiError(options.operation, response.status);
  }
  if (response.text.length === 0) {
    return null;
  }
  try {
    return JSON.parse(response.text);
  } catch {
    throw new DockerApiError(options.operation, response.status);
  }
};
