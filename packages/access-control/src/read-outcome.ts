// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadOutcomeInput, ReadOutcome } from "./types.js";
import { can } from "./can.js";

export const readOutcome = <Value>({
  value,
  subject,
  resource,
}: ReadOutcomeInput<Value>): ReadOutcome<Value> => {
  if (value === null) {
    return { outcome: "not-found" };
  }
  return can(subject, "view", resource) ? { outcome: "found", value } : { outcome: "forbidden" };
};
