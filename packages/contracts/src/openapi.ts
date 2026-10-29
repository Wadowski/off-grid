// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import {
  accessGroupIdSchema,
  errorResponseSchema,
  familyIdSchema,
  timestampSchema,
  userIdSchema,
} from "./primitives.js";

/**
 * Shared HTTP schemas published as OpenAPI components. Module routes add their
 * own paths and DTOs here as they are built.
 */
export const openApiComponentSchemas = {
  FamilyId: familyIdSchema,
  UserId: userIdSchema,
  AccessGroupId: accessGroupIdSchema,
  Timestamp: timestampSchema,
  ErrorResponse: errorResponseSchema,
} satisfies Record<string, z.ZodType>;

export function buildOpenApiDocument() {
  const schemas: Record<string, unknown> = {};
  for (const [name, schema] of Object.entries(openApiComponentSchemas)) {
    schemas[name] = z.toJSONSchema(schema);
  }
  return {
    openapi: "3.1.0",
    info: { title: "Offgrid API", version: "0.0.0" },
    paths: {},
    components: { schemas },
  };
}

/** The exact text written to `openapi.json`. Identical input always gives identical output. */
export function renderOpenApi(): string {
  return `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`;
}
