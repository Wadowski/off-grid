// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LoggerOptions, Logger, LogBindings, LogLevel } from "./types.js";
import { LEVEL_RANK } from "./constants.js";
import { writeToStdout } from "./write-to-stdout.js";
import { createRedactor } from "./create-redactor.js";
import { buildRecord } from "./build-record.js";

export const createLogger = (options: LoggerOptions = {}): Logger => {
  const threshold = LEVEL_RANK[options.level ?? "info"];
  const sink = options.sink ?? writeToStdout;
  const redactRecord = createRedactor(options.redact);
  const now = options.now ?? (() => new Date());

  const createScopedLogger = (bindings: LogBindings): Logger => {
    const write = (level: LogLevel, msg: string, fields: Record<string, unknown> = {}): void => {
      if (LEVEL_RANK[level] < threshold) {
        return;
      }
      sink(JSON.stringify(redactRecord(buildRecord(level, msg, bindings, fields, now))));
    };

    return {
      debug: (msg, fields) => write("debug", msg, fields),
      info: (msg, fields) => write("info", msg, fields),
      warn: (msg, fields) => write("warn", msg, fields),
      error: (msg, fields) => write("error", msg, fields),
      child: (extra) => createScopedLogger({ ...bindings, ...extra }),
    };
  };

  return createScopedLogger({ module: options.module, family_id: options.family_id });
};
