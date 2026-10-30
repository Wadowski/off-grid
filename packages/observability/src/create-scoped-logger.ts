// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LogBindings, LogSettings, Logger } from "./types.js";
import { writeLogRecord } from "./write-log-record.js";

export const createScopedLogger = (settings: LogSettings, bindings: LogBindings): Logger => ({
  debug: (msg, fields) => writeLogRecord(settings, bindings, "debug", msg, fields),
  info: (msg, fields) => writeLogRecord(settings, bindings, "info", msg, fields),
  warn: (msg, fields) => writeLogRecord(settings, bindings, "warn", msg, fields),
  error: (msg, fields) => writeLogRecord(settings, bindings, "error", msg, fields),
  child: (extra) => createScopedLogger(settings, { ...bindings, ...extra }),
});
