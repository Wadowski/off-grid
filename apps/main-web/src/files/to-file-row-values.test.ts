// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListItemSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toFileRowValues } from "./to-file-row-values.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const ITEM_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const VERSION_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";
const UPDATED_AT = "2026-03-04T05:06:07.000Z";

const base = {
  id: ITEM_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Photos",
  version: 1,
  createdAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
  deletedAt: null,
};

describe("toFileRowValues", () => {
  it("shows a folder with its item count and no size", () => {
    const folder = fileListItemSchema.parse({ ...base, isFolder: true, itemCount: 2 });

    expect(toFileRowValues(folder)).toEqual({
      name: "Photos",
      kind: "folder",
      modifiedAt: new Date(UPDATED_AT),
      itemCount: 2,
    });
  });

  it("shows a file with its size and its kind from the mime type, and no item count", () => {
    const file = fileListItemSchema.parse({
      ...base,
      name: "Trip.pdf",
      isFolder: false,
      mimeType: "application/pdf",
      size: 2048,
      currentVersionId: VERSION_ID,
    });

    expect(toFileRowValues(file)).toEqual({
      name: "Trip.pdf",
      kind: "pdf",
      modifiedAt: new Date(UPDATED_AT),
      sizeBytes: 2048,
    });
  });
});
