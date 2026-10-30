// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { currentTraceId } from "./current-trace-id.js";

export const traceIdField = (): { trace_id?: string } => {
  const traceId = currentTraceId();
  return traceId === undefined ? {} : { trace_id: traceId };
};
