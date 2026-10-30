// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { TRACE_ID_PATTERN } from "./constants.js";

export const isValidTraceId = (value: unknown): value is string =>
  typeof value === "string" && TRACE_ID_PATTERN.test(value);
