// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DOCKER_MISSING_STATUS } from "../constants.js";
import { requestEngineJson } from "./request-engine-json.js";

export const removeContainer = async (
  socketPath: string,
  containerIdOrName: string,
): Promise<void> => {
  await requestEngineJson(
    socketPath,
    "DELETE",
    `/containers/${encodeURIComponent(containerIdOrName)}?force=true`,
    { operation: "remove container", acceptedStatuses: [DOCKER_MISSING_STATUS] },
  );
};
