// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SourceVersionDecision } from "./types.js";

export function classifySourceVersion(
  storedVersion: number | null,
  incomingVersion: number,
): SourceVersionDecision {
  if (storedVersion === null) {
    return incomingVersion === 1 ? "apply" : "gap";
  }
  if (incomingVersion === storedVersion) {
    return "duplicate";
  }
  if (incomingVersion < storedVersion) {
    return "stale";
  }
  return incomingVersion === storedVersion + 1 ? "apply" : "gap";
}
