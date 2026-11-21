// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { filesOpenApiPaths } from "./files-open-api-paths.js";
import { FILE_NAME_HEADER, PARENT_ID_HEADER } from "./upload-headers.js";

describe("upload headers", () => {
  it("documents the upload headers under the shared header names", () => {
    const parameters = filesOpenApiPaths["/drives/{id}/files"].post.parameters;
    const headerNames = parameters
      .filter((parameter) => parameter.in === "header")
      .map((parameter) => parameter.name);

    expect(headerNames).toEqual([FILE_NAME_HEADER, PARENT_ID_HEADER]);
  });
});
