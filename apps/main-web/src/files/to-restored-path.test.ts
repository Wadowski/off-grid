// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toRestoredPath } from "./to-restored-path.js";
import type { Drive, FileEntry } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];

describe("toRestoredPath", () => {
  it("opens the drive root when the restored item is at the top of the drive", () => {
    expect(toRestoredPath(DRIVE_ID, { parentId: null } as FileEntry)).toBe(
      `/files/${DRIVE_ID}/folder`,
    );
  });

  it("opens the folder the restored item is in", () => {
    expect(toRestoredPath(DRIVE_ID, { parentId: FOLDER_ID } as FileEntry)).toBe(
      `/files/${DRIVE_ID}/folder/${FOLDER_ID}`,
    );
  });
});
