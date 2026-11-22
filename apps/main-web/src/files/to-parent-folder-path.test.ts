// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toParentFolderPath } from "./to-parent-folder-path.js";
import type { Breadcrumb, Drive, FileEntry } from "./types.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const HOLIDAY_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const BEACH_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as FileEntry["id"];
const DRIVE_CRUMB: Breadcrumb = { kind: "drive", id: DRIVE_ID, name: "Personal" };

describe("toParentFolderPath", () => {
  it("goes up to the drive root from a folder directly inside the drive", () => {
    const crumbs: Breadcrumb[] = [DRIVE_CRUMB, { kind: "folder", id: HOLIDAY_ID, name: "Holiday" }];

    expect(toParentFolderPath(DRIVE_ID, crumbs)).toBe(`/files/${DRIVE_ID}/folder`);
  });

  it("goes up to the folder above the current one", () => {
    const crumbs: Breadcrumb[] = [
      DRIVE_CRUMB,
      { kind: "folder", id: HOLIDAY_ID, name: "Holiday" },
      { kind: "folder", id: BEACH_ID, name: "Beach" },
    ];

    expect(toParentFolderPath(DRIVE_ID, crumbs)).toBe(`/files/${DRIVE_ID}/folder/${HOLIDAY_ID}`);
  });

  it("has no parent at the drive root", () => {
    expect(toParentFolderPath(DRIVE_ID, [DRIVE_CRUMB])).toBeNull();
  });
});
