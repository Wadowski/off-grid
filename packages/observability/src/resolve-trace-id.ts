// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isValidTraceId } from "./is-valid-trace-id.js";
import { randomUUID } from "node:crypto";

export const resolveTraceId = (incoming: unknown): string => {
  return isValidTraceId(incoming) ? incoming : randomUUID();
};
