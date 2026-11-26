// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import * as filesApi from "./files-api.js";
import { moveEntry } from "./move-entry.js";
import type { Drive, FileEntry } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FILE_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const FOLDER_ID = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d" as FileEntry["id"];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("moveEntry", () => {
  it("sends the drive and the target folder for a folder target", async () => {
    const move = vi
      .spyOn(filesApi, "moveFile")
      .mockResolvedValue({ file: {} as FileEntry, crossOwnerNotice: false });

    await moveEntry(FILE_ID, { driveId: DRIVE_ID, parentId: FOLDER_ID });

    expect(move).toHaveBeenCalledWith(FILE_ID, { driveId: DRIVE_ID, parentId: FOLDER_ID });
  });

  it("sends a null parent for the root of a drive", async () => {
    const move = vi
      .spyOn(filesApi, "moveFile")
      .mockResolvedValue({ file: {} as FileEntry, crossOwnerNotice: false });

    await moveEntry(FILE_ID, { driveId: DRIVE_ID, parentId: null });

    expect(move).toHaveBeenCalledWith(FILE_ID, { driveId: DRIVE_ID, parentId: null });
  });
});
