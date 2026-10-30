// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LoggerOptions, Logger } from "./types.js";
import { LEVEL_RANK } from "./constants.js";
import { writeToStdout } from "./write-to-stdout.js";
import { createRedactor } from "./create-redactor.js";
import { createScopedLogger } from "./create-scoped-logger.js";

export const createLogger = (options: LoggerOptions = {}): Logger =>
  createScopedLogger(
    {
      threshold: LEVEL_RANK[options.level ?? "info"],
      sink: options.sink ?? writeToStdout,
      redactRecord: createRedactor(options.redact),
      now: options.now ?? (() => new Date()),
    },
    options.bindings ?? {},
  );
