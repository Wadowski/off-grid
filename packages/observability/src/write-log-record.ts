// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LogBindings, LogLevel, LogSettings } from "./types.js";
import { LEVEL_RANK } from "./constants.js";
import { buildRecord } from "./build-record.js";

export const writeLogRecord = (
  settings: LogSettings,
  bindings: LogBindings,
  level: LogLevel,
  msg: string,
  fields: Record<string, unknown> = {},
): void => {
  if (LEVEL_RANK[level] < settings.threshold) {
    return;
  }
  settings.sink(
    JSON.stringify(settings.redactRecord(buildRecord(level, msg, bindings, fields, settings.now))),
  );
};
