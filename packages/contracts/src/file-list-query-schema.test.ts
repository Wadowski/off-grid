// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createFolderRequestSchema } from "./create-folder-request-schema.js";
import { fileListQuerySchema, trashListQuerySchema } from "./file-list-query-schema.js";
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
  it("defaults to 50 entries sorted by name ascending and leaves the cursor out", () => {
    expect(fileListQuerySchema.parse({})).toEqual({ limit: 50, sort: "name", direction: "asc" });
  });

  it("accepts each sort field and direction", () => {
    expect(fileListQuerySchema.parse({ sort: "modified", direction: "desc" })).toMatchObject({
      sort: "modified",
      direction: "desc",
    });
    expect(fileListQuerySchema.parse({ sort: "size" })).toMatchObject({ sort: "size" });
  });

  it.each([{ sort: "type" }, { direction: "up" }])(
    "rejects an unknown sort or direction %o",
    (query) => {
      expect(fileListQuerySchema.safeParse(query).success).toBe(false);
    },
  );

  it("reads a numeric limit from a query string", () => {
    expect(fileListQuerySchema.parse({ limit: "200" })).toMatchObject({ limit: 200 });
  });

  it.each(["0", "201", "abc"])("rejects a limit of %s", (limit) => {
    expect(fileListQuerySchema.safeParse({ limit }).success).toBe(false);
  });
});

describe("trashListQuerySchema", () => {
  it("takes a cursor and a limit only", () => {
    expect(trashListQuerySchema.parse({})).toEqual({ limit: 50 });
    expect(trashListQuerySchema.parse({ limit: "10" })).toEqual({ limit: 10 });
  });

  it.each([{ sort: "size" }, { direction: "desc" }])(
    "rejects sort or direction %o instead of ignoring it",
    (query) => {
      expect(trashListQuerySchema.safeParse(query).success).toBe(false);
    },
  );
});
