// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { requestEngineJson } from "./request-engine-json.js";

export const renameContainer = async (
  socketPath: string,
  containerId: string,
  newName: string,
): Promise<void> => {
  await requestEngineJson(
    socketPath,
    "POST",
    `/containers/${containerId}/rename?name=${encodeURIComponent(newName)}`,
    { operation: "rename container" },
  );
};
