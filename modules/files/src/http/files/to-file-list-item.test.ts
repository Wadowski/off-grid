// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { FileRecord } from "../../types.js";
import { toFileListItem } from "./to-file-list-item.js";

const DRIVE_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f";
const FOLDER_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e60";
const FILE_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e61";
const CREATED_AT = new Date("2026-01-02T03:04:05.000Z");

const folderRecord: FileRecord = {
  fileId: FOLDER_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Photos",
  isFolder: true,
  mimeType: null,
  sizeBytes: null,
  currentVersionId: null,
  version: 1,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  deletedAt: null,
};

const fileRecord: FileRecord = {
  fileId: FILE_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Report.pdf",
  isFolder: false,
  mimeType: "application/pdf",
  sizeBytes: 2048n,
  currentVersionId: FOLDER_ID,
  version: 1,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  deletedAt: null,
};

describe("toFileListItem", () => {
  it("adds the item count of a folder from the counts", () => {
    const counts = new Map([[FOLDER_ID, 3]]);

    expect(toFileListItem(folderRecord, counts)).toMatchObject({ isFolder: true, itemCount: 3 });
  });

  it("reports zero items for a folder missing from the counts", () => {
    expect(toFileListItem(folderRecord, new Map())).toMatchObject({ itemCount: 0 });
  });

  it("leaves the item count off a regular file", () => {
    const item = toFileListItem(fileRecord, new Map([[FILE_ID, 9]]));

    expect(item.isFolder).toBe(false);
    expect(item).not.toHaveProperty("itemCount");
  });
});
