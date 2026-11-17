// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createFolderRequestSchema } from "./create-folder-request-schema.js";
import { fileListQuerySchema } from "./file-list-query-schema.js";
import { moveFileRequestSchema } from "./move-file-request-schema.js";

const DRIVE_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f";

describe("createFolderRequestSchema", () => {
  it("accepts a root folder with a trimmed name", () => {
    expect(createFolderRequestSchema.parse({ parentId: null, name: " Photos " })).toEqual({
      parentId: null,
      name: "Photos",
    });
  });

  it("rejects a folder name that contains a slash", () => {
    expect(createFolderRequestSchema.safeParse({ parentId: null, name: "a/b" }).success).toBe(
      false,
    );
  });
});

describe("moveFileRequestSchema", () => {
  it("requires a drive id and a parent id that may be null", () => {
    expect(moveFileRequestSchema.safeParse({ driveId: DRIVE_ID, parentId: null }).success).toBe(
      true,
    );
    expect(moveFileRequestSchema.safeParse({ driveId: DRIVE_ID }).success).toBe(false);
  });
});

describe("fileListQuerySchema", () => {
  it("defaults the limit to 50 and leaves the cursor out", () => {
    expect(fileListQuerySchema.parse({})).toEqual({ limit: 50 });
  });

  it("reads a numeric limit from a query string", () => {
    expect(fileListQuerySchema.parse({ limit: "200" })).toEqual({ limit: 200 });
  });

  it.each(["0", "201", "abc"])("rejects a limit of %s", (limit) => {
    expect(fileListQuerySchema.safeParse({ limit }).success).toBe(false);
  });
});
