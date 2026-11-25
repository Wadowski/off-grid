// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { Breadcrumb, FileListItem } from "../../files/types.js";
import { toTrashClearsSelection } from "./to-trash-clears-selection.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Extract<
  Breadcrumb,
  { kind: "drive" }
>["id"];
const PARENT_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileListItem["id"];
const FOLDER_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as FileListItem["id"];
const FILE_ID = "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c" as FileListItem["id"];
const OTHER_ID = "4a5b6c7d-8e9f-4a0b-8c1d-2e3f4a5b6c7d" as FileListItem["id"];
const CHAIN: readonly Breadcrumb[] = [
  { kind: "drive", id: DRIVE_ID, name: "Personal" },
  { kind: "folder", id: PARENT_ID, name: "Family" },
  { kind: "folder", id: FOLDER_ID, name: "Photos" },
];

describe("toTrashClearsSelection", () => {
  it("clears when the selected file itself is trashed", () => {
    expect(toTrashClearsSelection(FILE_ID, FILE_ID, CHAIN)).toBe(true);
  });

  it("clears when the folder holding the selected file is trashed", () => {
    expect(toTrashClearsSelection(FOLDER_ID, FILE_ID, CHAIN)).toBe(true);
  });

  it("clears when an ancestor folder of the selected file is trashed", () => {
    expect(toTrashClearsSelection(PARENT_ID, FILE_ID, CHAIN)).toBe(true);
  });

  it("keeps the selection when an unrelated entry is trashed", () => {
    expect(toTrashClearsSelection(OTHER_ID, FILE_ID, CHAIN)).toBe(false);
  });

  it("keeps the selection when no file is selected", () => {
    expect(toTrashClearsSelection(FOLDER_ID, null, CHAIN)).toBe(false);
  });
});
