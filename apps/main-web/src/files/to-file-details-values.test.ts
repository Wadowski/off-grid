// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { toFileDetailsValues } from "./to-file-details-values.js";
import type { RegularFileEntry } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const VERSION_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";
const CREATED_AT = "2026-03-01T08:00:00.000Z";
const UPDATED_AT = "2026-03-04T05:06:07.000Z";

const regularFile = (): RegularFileEntry =>
  fileSchema.parse({
    id: FILE_ID,
    driveId: DRIVE_ID,
    parentId: null,
    name: "Trip.pdf",
    version: 3,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    deletedAt: null,
    isFolder: false,
    mimeType: "application/pdf",
    size: 2048,
    currentVersionId: VERSION_ID,
  }) as RegularFileEntry;

describe("toFileDetailsValues", () => {
  it("maps a regular file to the values the details screen shows", () => {
    expect(toFileDetailsValues(regularFile())).toEqual({
      name: "Trip.pdf",
      kind: "pdf",
      sizeBytes: 2048,
      version: 3,
      createdAt: new Date(CREATED_AT),
      updatedAt: new Date(UPDATED_AT),
    });
  });
});
