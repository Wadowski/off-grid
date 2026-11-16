// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { crossEntityLinkParamsSchema } from "./cross-entity-link-params-schema.js";
import { z } from "zod";

const jsonContent = (schemaName: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaName}` } },
});

const response = (schemaName?: string) => ({
  description: "",
  ...(schemaName === undefined ? {} : { content: jsonContent(schemaName) }),
});

const linkIdParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: z.toJSONSchema(crossEntityLinkParamsSchema.shape.id),
};

export const relationsOpenApiPaths = {
  "/links": {
    get: {
      operationId: "listCrossEntityLinks",
      parameters: [
        {
          name: "entityType",
          in: "query",
          required: true,
          schema: { type: "string", enum: ["calendar-event"] },
        },
        {
          name: "entityId",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        "200": response("CrossEntityLinkList"),
        "400": response("ErrorResponse"),
        "401": response("ErrorResponse"),
      },
    },
    post: {
      operationId: "createCrossEntityLink",
      requestBody: { required: true, content: jsonContent("CreateCrossEntityLinkRequest") },
      responses: {
        "200": response("CrossEntityLink"),
        "201": response("CrossEntityLink"),
        "400": response("ErrorResponse"),
        "401": response("ErrorResponse"),
        "404": response("ErrorResponse"),
        "409": response("ErrorResponse"),
        "422": response("ErrorResponse"),
      },
    },
  },
  "/links/{id}": {
    delete: {
      operationId: "removeCrossEntityLink",
      parameters: [linkIdParameter],
      responses: {
        "204": response(),
        "400": response("ErrorResponse"),
        "401": response("ErrorResponse"),
        "404": response("ErrorResponse"),
      },
    },
  },
};
