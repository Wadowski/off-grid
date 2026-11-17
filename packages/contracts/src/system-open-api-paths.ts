// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const jsonContent = (schemaName: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaName}` } },
});

export const systemOpenApiPaths = {
  "/system/version": {
    get: {
      operationId: "getSystemVersion",
      responses: {
        "200": { description: "", content: jsonContent("SystemVersion") },
      },
    },
  },
};
