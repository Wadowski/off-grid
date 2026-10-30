// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LogLevel, LogBindings } from "./types.js";
import { currentTraceId } from "./current-trace-id.js";

export const buildRecord = (
  level: LogLevel,
  msg: string,
  bindings: LogBindings,
  fields: Record<string, unknown>,
  now: () => Date,
): Record<string, unknown> => ({
  ...fields,
  ...bindings,
  level,
  time: now().toISOString(),
  msg,
  trace_id: currentTraceId(),
});
