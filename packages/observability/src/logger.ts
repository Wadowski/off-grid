// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { currentTraceId } from "./trace.js";
import { createRedactor, type RedactOptions } from "./redact.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export type LogSink = (line: string) => void;

export interface LogBindings {
  readonly module?: string;
  readonly family_id?: string;
}

export interface LoggerOptions extends LogBindings {
  /** Lowest level that is written. Defaults to `info`. */
  readonly level?: LogLevel;
  /** Receives one JSON line per record. Defaults to standard output. */
  readonly sink?: LogSink;
  /** Redaction applied to every record, including fields passed per call. */
  readonly redact?: RedactOptions;
  readonly now?: () => Date;
}

export interface Logger {
  debug(msg: string, fields?: Record<string, unknown>): void;
  info(msg: string, fields?: Record<string, unknown>): void;
  warn(msg: string, fields?: Record<string, unknown>): void;
  error(msg: string, fields?: Record<string, unknown>): void;
  /** Returns a logger that adds `bindings` to every record it writes. */
  child(bindings: LogBindings): Logger;
}

const writeToStdout: LogSink = (line) => {
  process.stdout.write(`${line}\n`);
};

/**
 * Structured JSON logger. Every record carries the current `trace_id` from the trace context,
 * plus `module` and `family_id` when they are known. Sensitive fields are redacted before writing.
 * The logger makes no network calls.
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  const threshold = LEVEL_RANK[options.level ?? "info"];
  const sink = options.sink ?? writeToStdout;
  const redactValue = createRedactor(options.redact);
  const now = options.now ?? (() => new Date());

  const build = (bindings: LogBindings): Logger => {
    const write = (level: LogLevel, msg: string, fields: Record<string, unknown> = {}): void => {
      if (LEVEL_RANK[level] < threshold) {
        return;
      }
      const record = {
        ...fields,
        // Set after the caller's fields so a caller cannot replace the envelope or the trace context.
        level,
        time: now().toISOString(),
        msg,
        module: bindings.module,
        family_id: bindings.family_id,
        trace_id: currentTraceId(),
      };
      sink(JSON.stringify(redactValue(record)));
    };

    return {
      debug: (msg, fields) => write("debug", msg, fields),
      info: (msg, fields) => write("info", msg, fields),
      warn: (msg, fields) => write("warn", msg, fields),
      error: (msg, fields) => write("error", msg, fields),
      child: (extra) => build({ ...bindings, ...extra }),
    };
  };

  return build({ module: options.module, family_id: options.family_id });
}
