// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListItemSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { splitFoldersAndFiles } from "./split-folders-and-files.js";
import type { FileListItem } from "./types.js";

const UPDATED_AT = "2026-01-01T00:00:00.000Z";
const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const uuidOf = (index: number) => `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;

const folder = (id: string, name: string): FileListItem =>
  fileListItemSchema.parse({
    id,
    driveId: DRIVE_ID,
    parentId: null,
    name,
    version: 1,
    createdAt: UPDATED_AT,
    updatedAt: UPDATED_AT,
    deletedAt: null,
    isFolder: true,
    itemCount: 0,
  });

const file = (id: string, name: string): FileListItem =>
  fileListItemSchema.parse({
    id,
    driveId: DRIVE_ID,
    parentId: null,
    name,
    version: 1,
    createdAt: UPDATED_AT,
    updatedAt: UPDATED_AT,
    deletedAt: null,
    isFolder: false,
    mimeType: "text/plain",
    size: 10,
    currentVersionId: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d",
  });

describe("splitFoldersAndFiles", () => {
  const names = (items: readonly FileListItem[]) => items.map((item) => item.name);

  it("returns empty groups for no entries", () => {
    expect(splitFoldersAndFiles([])).toEqual({ folders: [], files: [] });
  });

  it("puts only folders in the folder group when there are no files", () => {
    const result = splitFoldersAndFiles([folder(uuidOf(1), "Zulu"), folder(uuidOf(2), "Alpha")]);

    expect(names(result.folders)).toEqual(["Zulu", "Alpha"]);
    expect(result.files).toEqual([]);
  });

  it("puts only files in the file group when there are no folders", () => {
    const result = splitFoldersAndFiles([file(uuidOf(3), "b.txt"), file(uuidOf(4), "a.txt")]);

    expect(result.folders).toEqual([]);
    expect(names(result.files)).toEqual(["b.txt", "a.txt"]);
  });

  it("splits mixed entries and keeps the order inside each group", () => {
    const result = splitFoldersAndFiles([
      folder(uuidOf(1), "Zulu"),
      file(uuidOf(2), "Large.txt"),
      folder(uuidOf(3), "Alpha"),
      file(uuidOf(4), "Small.txt"),
    ]);

    expect(names(result.folders)).toEqual(["Zulu", "Alpha"]);
    expect(names(result.files)).toEqual(["Large.txt", "Small.txt"]);
  });
});
