// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { filesOpenApiPaths } from "./files-open-api-paths.js";

const operationsOf = (path: "/files/{id}/content" | "/files/{id}/versions/{versionId}/content") =>
  filesOpenApiPaths[path].get;

describe("file content operations", () => {
  it.each([["/files/{id}/content"], ["/files/{id}/versions/{versionId}/content"]] as const)(
    "%s documents the disposition query and the Range header",
    (path) => {
      const operation = operationsOf(path);

      expect(operation.parameters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "disposition", in: "query" }),
          expect.objectContaining({ name: "Range", in: "header" }),
        ]),
      );
    },
  );

  it.each([["/files/{id}/content"], ["/files/{id}/versions/{versionId}/content"]] as const)(
    "%s documents the 206 and 416 answers and their headers",
    (path) => {
      const { responses } = operationsOf(path);

      expect(Object.keys(responses)).toEqual(
        expect.arrayContaining(["200", "206", "400", "401", "404", "416"]),
      );
      expect(Object.keys(responses["206"]?.headers ?? {})).toEqual(
        expect.arrayContaining(["Content-Range", "Accept-Ranges", "X-Content-Type-Options"]),
      );
      expect(Object.keys(responses["416"]?.headers ?? {})).toEqual(
        expect.arrayContaining(["Content-Range", "Accept-Ranges"]),
      );
    },
  );

  it.each([["/files/{id}/content"], ["/files/{id}/versions/{versionId}/content"]] as const)(
    "%s documents the safe headers of every success",
    (path) => {
      const { responses } = operationsOf(path);

      expect(Object.keys(responses["200"]?.headers ?? {})).toEqual(
        expect.arrayContaining([
          "Content-Disposition",
          "Content-Length",
          "Cache-Control",
          "X-Content-Type-Options",
          "Accept-Ranges",
          "Content-Security-Policy",
        ]),
      );
    },
  );
});
