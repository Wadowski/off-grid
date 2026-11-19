// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerResponse } from "node:http";
import { HEARTBEAT_COMMENT } from "../../constants.js";
import type { StreamSessionState } from "../../types.js";

export const startHeartbeat = (
  response: ServerResponse,
  intervalMs: number,
  checkSession: () => Promise<StreamSessionState>,
  onEnded: () => void,
): (() => void) => {
  let tickRunning = false;

  const runTick = async (): Promise<void> => {
    if (tickRunning) {
      return;
    }
    tickRunning = true;
    try {
      if (response.writableEnded || response.destroyed) {
        return;
      }
      response.write(HEARTBEAT_COMMENT);
      if ((await checkSession()) === "ended") {
        onEnded();
      }
    } finally {
      tickRunning = false;
    }
  };

  const timer = setInterval(() => {
    void runTick();
  }, intervalMs);
  return () => clearInterval(timer);
};
