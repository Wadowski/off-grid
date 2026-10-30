// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { openApiComponentSchemas } from "./open-api-component-schemas.js";
import { z } from "zod";

export const buildOpenApiDocument = () => {
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
};
