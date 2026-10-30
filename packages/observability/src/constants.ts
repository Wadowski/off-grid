// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LogLevel } from "./types.js";

export const DEFAULT_CAPACITY = 200;

export const LEVEL_RANK: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export const REDACTED = "[REDACTED]";

export const CIRCULAR = "[Circular]";

export const TRUNCATED = "[Truncated]";

export const DEFAULT_MAX_DEPTH = 10;

export const SENSITIVE_WORDS = [
  "password",
  "passwd",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apikey",
  "privatekey",
  "auth",
  "bearer",
  "session",
  "refresh",
  "jwt",
  "credential",
  "ssn",
];

export const TRACE_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;
