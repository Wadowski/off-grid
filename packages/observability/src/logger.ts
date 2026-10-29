// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createRedactor } from "./redact.js";
import { currentTraceId } from "./trace.js";
import type { LogBindings, LogLevel, LogSink, Logger, LoggerOptions } from "./types.js";

const LEVEL_RANK: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const writeToStdout: LogSink = (line) => {
  process.stdout.write(`${line}\n`);
};

const buildRecord = (
  level: LogLevel,
  msg: string,
  bindings: LogBindings,
  fields: Record<string, unknown>,
  now: () => Date,
): Record<string, unknown> => ({
  ...fields,
  level,
  time: now().toISOString(),
  msg,
  module: bindings.module,
  family_id: bindings.family_id,
  trace_id: currentTraceId(),
});

export function createLogger(options: LoggerOptions = {}): Logger {
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
}
