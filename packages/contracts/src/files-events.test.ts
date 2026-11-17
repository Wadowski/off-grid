// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { driveCreatedV1 } from "./drive-created-v1.js";
import { fileCreatedV1 } from "./file-created-v1.js";
import { fileRemovedV1 } from "./file-removed-v1.js";
import { fileUpdatedV1 } from "./file-updated-v1.js";

const ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f";
const OTHER_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e60";

const FORBIDDEN_FIELDS = ["content", "storageKey", "checksum", "sha256", "path", "mimeType"];

const filePayload = {
  fileId: ID,
  driveId: ID,
  ownerUserId: ID,
  ownerFamilyId: null,
  parentId: null,
  isFolder: false,
  name: "Report.pdf",
  size: 2048,
  currentVersionId: OTHER_ID,
  deletedAt: null,
  version: 3,
};

const removedPayload = {
  fileId: ID,
  driveId: ID,
  ownerUserId: null,
  ownerFamilyId: ID,
  version: 4,
};

const drivePayload = {
  driveId: ID,
  ownerUserId: null,
  ownerFamilyId: ID,
};

const keysOf = (schema: { shape: Record<string, unknown> }): string[] =>
  Object.keys(schema.shape).sort();

describe("file-created-v1 and file-updated-v1 payload", () => {
  it.each([
    ["file-created-v1", fileCreatedV1],
    ["file-updated-v1", fileUpdatedV1],
  ])("%s carries exactly the agreed fields, including the name", (_name, definition) => {
    expect(keysOf(definition.schema)).toEqual(
      [
        "currentVersionId",
        "deletedAt",
        "driveId",
        "fileId",
        "isFolder",
        "name",
        "ownerFamilyId",
        "ownerUserId",
        "parentId",
        "size",
        "version",
      ].sort(),
    );
  });

  it.each([
    ["file-created-v1", fileCreatedV1],
    ["file-updated-v1", fileUpdatedV1],
  ])("%s rejects content, storage, checksum, path and mime fields", (_name, definition) => {
    for (const field of FORBIDDEN_FIELDS) {
      const result = definition.schema.safeParse({ ...filePayload, [field]: "x" });
      expect(result.success, field).toBe(false);
    }
  });

  it("accepts a file owned by a user", () => {
    expect(fileCreatedV1.schema.safeParse(filePayload).success).toBe(true);
  });

  it("accepts a folder with no size and no current version", () => {
    const folder = {
      ...filePayload,
      isFolder: true,
      size: null,
      currentVersionId: null,
    };
    expect(fileUpdatedV1.schema.safeParse(folder).success).toBe(true);
  });

  it("rejects a file with no owner", () => {
    expect(
      fileCreatedV1.schema.safeParse({ ...filePayload, ownerUserId: null, ownerFamilyId: null })
        .success,
    ).toBe(false);
  });

  it("rejects a file with two owners", () => {
    expect(fileCreatedV1.schema.safeParse({ ...filePayload, ownerFamilyId: ID }).success).toBe(
      false,
    );
  });
});

describe("file-removed-v1 payload", () => {
  it("carries exactly the ids, owner and version and no name", () => {
    expect(keysOf(fileRemovedV1.schema)).toEqual(
      ["driveId", "fileId", "ownerFamilyId", "ownerUserId", "version"].sort(),
    );
  });

  it("rejects a name and every content field", () => {
    for (const field of [...FORBIDDEN_FIELDS, "name"]) {
      const result = fileRemovedV1.schema.safeParse({ ...removedPayload, [field]: "x" });
      expect(result.success, field).toBe(false);
    }
  });

  it("accepts a payload with exactly one owner", () => {
    expect(fileRemovedV1.schema.safeParse(removedPayload).success).toBe(true);
  });

  it("rejects a payload with two owners", () => {
    expect(fileRemovedV1.schema.safeParse({ ...removedPayload, ownerUserId: ID }).success).toBe(
      false,
    );
  });
});

describe("drive-created-v1 payload", () => {
  it("carries exactly the drive id and owner, and no name", () => {
    expect(keysOf(driveCreatedV1.schema)).toEqual(
      ["driveId", "ownerFamilyId", "ownerUserId"].sort(),
    );
  });

  it("rejects a name and every content field", () => {
    for (const field of [...FORBIDDEN_FIELDS, "name"]) {
      const result = driveCreatedV1.schema.safeParse({ ...drivePayload, [field]: "x" });
      expect(result.success, field).toBe(false);
    }
  });

  it("accepts a family drive and a personal drive", () => {
    expect(driveCreatedV1.schema.safeParse(drivePayload).success).toBe(true);
    expect(
      driveCreatedV1.schema.safeParse({ driveId: ID, ownerUserId: ID, ownerFamilyId: null })
        .success,
    ).toBe(true);
  });

  it("rejects a drive with no owner or two owners", () => {
    expect(
      driveCreatedV1.schema.safeParse({ driveId: ID, ownerUserId: null, ownerFamilyId: null })
        .success,
    ).toBe(false);
    expect(
      driveCreatedV1.schema.safeParse({ driveId: ID, ownerUserId: ID, ownerFamilyId: ID }).success,
    ).toBe(false);
  });
});
