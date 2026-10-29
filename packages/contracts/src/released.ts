// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import type { AnyEventDefinition, ContractComparison, EventSchemas } from "./types.js";

export function currentEventSchemas(definitions: readonly AnyEventDefinition[]): EventSchemas {
  const schemas: EventSchemas = {};
  for (const definition of definitions) {
    schemas[definition.name] = {
      version: definition.version,
      schema: z.toJSONSchema(definition.envelope),
    };
  }
  return schemas;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, nested: unknown) => {
    if (typeof nested !== "object" || nested === null || Array.isArray(nested)) {
      return nested;
    }
    return Object.fromEntries(Object.entries(nested).sort(([a], [b]) => (a < b ? -1 : 1)));
  });
}

export function compareReleasedEvents(
  released: EventSchemas,
  current: EventSchemas,
): ContractComparison {
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
}
