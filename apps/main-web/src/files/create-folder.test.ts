// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { createFolder as createFolderRequest } from "./files-api.js";
import { createFolder } from "./create-folder.js";
import type { Drive, FileEntry } from "./types.js";

vi.mock("./files-api.js", () => ({ createFolder: vi.fn() }));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const ENTRY = { id: FOLDER_ID, name: "Holiday" } as FileEntry;

afterEach(() => {
  vi.resetAllMocks();
});

describe("createFolder", () => {
  it("creates the folder at the drive root when there is no parent", async () => {
    vi.mocked(createFolderRequest).mockResolvedValue(ENTRY);

    await expect(createFolder(DRIVE_ID, null, "Holiday")).resolves.toEqual(ENTRY);
    expect(createFolderRequest).toHaveBeenCalledWith(DRIVE_ID, { parentId: null, name: "Holiday" });
  });

  it("creates the folder inside the given parent folder", async () => {
    vi.mocked(createFolderRequest).mockResolvedValue(ENTRY);

    await createFolder(DRIVE_ID, FOLDER_ID, "Beach");
    expect(createFolderRequest).toHaveBeenCalledWith(DRIVE_ID, {
      parentId: FOLDER_ID,
      name: "Beach",
    });
  });
});
