// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerRuntime } from "./types.js";

export const logCheckFailure = (runtime: ServerRuntime, check: string, error: unknown): void => {
  const errorName = error instanceof Error ? error.name : "NonError";
  runtime.logger.warn("readiness check failed", { check, error_name: errorName });
};
