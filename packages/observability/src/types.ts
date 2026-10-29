// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogSink = (line: string) => void;

export interface LogBindings {
  readonly module?: string;
  readonly family_id?: string;
}

export interface LoggerOptions extends LogBindings {
  readonly level?: LogLevel;
  readonly sink?: LogSink;
  readonly redact?: RedactOptions;
  readonly now?: () => Date;
}

export interface Logger {
  debug(msg: string, fields?: Record<string, unknown>): void;
  info(msg: string, fields?: Record<string, unknown>): void;
  warn(msg: string, fields?: Record<string, unknown>): void;
  error(msg: string, fields?: Record<string, unknown>): void;
  child(bindings: LogBindings): Logger;
}

export interface RedactOptions {
  readonly extraKeys?: readonly string[];
  readonly maxDepth?: number;
}

export interface ErrorRecord {
  readonly recorded_at: string;
  readonly name: string;
  readonly code?: string;
  readonly trace_id?: string;
  readonly context: unknown;
}

export interface ErrorSink {
  record(error: unknown, context?: Record<string, unknown>): void;
}

export interface MemoryErrorSinkOptions {
  readonly capacity?: number;
  readonly now?: () => Date;
}
