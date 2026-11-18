// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DOCKER_SUCCESS_STATUSES } from "../constants.js";
import { requestEngineJson } from "./request-engine-json.js";

export const stopContainer = async (socketPath: string, containerId: string): Promise<void> => {
  await requestEngineJson(socketPath, "POST", `/containers/${containerId}/stop`, {
    operation: "stop container",
    acceptedStatuses: DOCKER_SUCCESS_STATUSES,
  });
};
