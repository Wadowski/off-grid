// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { fileListItemSchema } from "./file-list-item-schema.js";

const ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f";
const TIMESTAMP = "2026-01-02T03:04:05.000Z";

const baseEntry = {
  id: ID,
  driveId: ID,
  parentId: null,
  name: "Photos",
  version: 1,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: null,
};

const folderItem = { ...baseEntry, isFolder: true, itemCount: 3 };

const regularFileItem = {
  ...baseEntry,
  name: "Report.pdf",
  isFolder: false,
  mimeType: "application/pdf",
  size: 2048,
  currentVersionId: ID,
};

describe("fileListItemSchema", () => {
  it("accepts a folder item with an item count", () => {
    expect(fileListItemSchema.parse(folderItem)).toEqual(folderItem);
  });

  it("accepts a folder item with zero items", () => {
    expect(fileListItemSchema.safeParse({ ...folderItem, itemCount: 0 }).success).toBe(true);
  });

  it("accepts a regular file item without an item count", () => {
    expect(fileListItemSchema.parse(regularFileItem)).toEqual(regularFileItem);
  });

  it.each([
    ["a missing item count", { ...folderItem, itemCount: undefined }],
    ["a negative item count", { ...folderItem, itemCount: -1 }],
    ["a fractional item count", { ...folderItem, itemCount: 1.5 }],
  ])("rejects a folder item with %s", (_label, item) => {
    expect(fileListItemSchema.safeParse(item).success).toBe(false);
  });
});
