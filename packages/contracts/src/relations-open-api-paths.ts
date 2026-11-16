// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { crossEntityLinkParamsSchema } from "./cross-entity-link-params-schema.js";
import { z } from "zod";

const jsonContent = (schemaName: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaName}` } },
});

const errorResponse = (description: string) => ({
  description,
  content: jsonContent("ErrorResponse"),
});

const linkIdParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: z.toJSONSchema(crossEntityLinkParamsSchema.shape.id),
};

const unauthenticated = errorResponse("UNAUTHENTICATED: the request has no signed-in person.");

export const relationsOpenApiPaths = {
  "/links": {
    get: {
      operationId: "listCrossEntityLinks",
      summary: "List the links of an entity that the signed-in person can see",
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
        "200": {
          description: "The visible links, with the title of the other end.",
          content: jsonContent("CrossEntityLinkList"),
        },
        "400": errorResponse("VALIDATION_FAILED: the query does not match the request schema."),
        "401": unauthenticated,
      },
    },
    post: {
      operationId: "createCrossEntityLink",
      summary: "Link two entities that the signed-in person can see",
      requestBody: { required: true, content: jsonContent("CreateCrossEntityLinkRequest") },
      responses: {
        "200": {
          description: "The link already existed; the existing link is returned.",
          content: jsonContent("CrossEntityLink"),
        },
        "201": { description: "The created link.", content: jsonContent("CrossEntityLink") },
        "400": errorResponse("VALIDATION_FAILED: the body does not match the request schema."),
        "401": unauthenticated,
        "404": errorResponse("NOT_FOUND: an entity does not exist or the person cannot see it."),
        "422": errorResponse("UNPROCESSABLE: an entity cannot be linked to itself."),
      },
    },
  },
  "/links/{id}": {
    delete: {
      operationId: "removeCrossEntityLink",
      summary: "Remove a link the signed-in person owns",
      parameters: [linkIdParameter],
      responses: {
        "204": { description: "The link was removed." },
        "400": errorResponse("VALIDATION_FAILED: the id does not match the schema."),
        "401": unauthenticated,
        "404": errorResponse("NOT_FOUND: the link does not exist or the person cannot see it."),
      },
    },
  },
};
