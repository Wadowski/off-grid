// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveIdSchema, fileListItemSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toEntryPath } from "./to-entry-path.js";

const DRIVE_ID = driveIdSchema.parse("3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d");
const ITEM_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const UPDATED_AT = "2026-01-01T00:00:00.000Z";

const entry = (isFolder: boolean) =>
  fileListItemSchema.parse({
    id: ITEM_ID,
    driveId: DRIVE_ID,
    parentId: null,
    name: "Entry",
    version: 1,
    createdAt: UPDATED_AT,
    updatedAt: UPDATED_AT,
    deletedAt: null,
    ...(isFolder
      ? { isFolder: true, itemCount: 0 }
      : {
          isFolder: false,
          mimeType: "application/pdf",
          size: 1,
          currentVersionId: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d",
        }),
  });

describe("toEntryPath", () => {
  it("opens a folder in the folder view", () => {
    expect(toEntryPath(DRIVE_ID, entry(true))).toBe(`/files/${DRIVE_ID}/folder/${ITEM_ID}`);
  });

  it("opens a file in its details view", () => {
    expect(toEntryPath(DRIVE_ID, entry(false))).toBe(`/files/${DRIVE_ID}/file/${ITEM_ID}`);
  });
});
