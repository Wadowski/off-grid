// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isValidTraceId } from "./is-valid-trace-id.js";
import { storage } from "./storage.js";

export const runWithTrace = <T>(traceId: string, fn: () => T): T => {
  if (!isValidTraceId(traceId)) {
    throw new TypeError("trace id must be 1 to 128 letters, digits, dots, underscores or hyphens");
  }
  return storage.run({ traceId }, fn);
};
