// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerRuntime, CheckStatus } from "./types.js";
import { logCheckFailure } from "./log-check-failure.js";

export const databaseCheck = async (runtime: ServerRuntime): Promise<CheckStatus> => {
  try {
    await runtime.pool.query("SELECT 1");
    return "ok";
  } catch (error) {
    logCheckFailure(runtime, "database", error);
    return "unavailable";
  }
};
