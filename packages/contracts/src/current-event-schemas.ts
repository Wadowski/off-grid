// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition, EventSchemas } from "./types.js";
import { z } from "zod";

export const currentEventSchemas = (definitions: readonly AnyEventDefinition[]): EventSchemas => {
  const schemas: EventSchemas = {};
  for (const definition of definitions) {
    schemas[definition.name] = {
      version: definition.version,
      schema: z.toJSONSchema(definition.envelope),
    };
  }
  return schemas;
};
