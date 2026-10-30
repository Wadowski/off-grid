// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventSchemas, ContractComparison } from "./types.js";
import { canonicalJson } from "./canonical-json.js";

export const compareReleasedEvents = (
  released: EventSchemas,
  current: EventSchemas,
): ContractComparison => {
  const releasedNames = Object.keys(released).sort();
  const changed: string[] = [];
  const missing: string[] = [];
  for (const name of releasedNames) {
    const now = current[name];
    if (now === undefined) {
      missing.push(name);
    } else if (canonicalJson(now) !== canonicalJson(released[name])) {
      changed.push(name);
    }
  }
  const added = Object.keys(current)
    .filter((name) => !(name in released))
    .sort();
  return { changed, missing, added };
};
