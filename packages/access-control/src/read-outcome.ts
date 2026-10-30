// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { can } from "./access.js";
import type { ReadOutcome, ReadOutcomeInput } from "./types.js";

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
