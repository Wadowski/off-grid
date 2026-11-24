// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { FileListItem } from "../../files/types.js";
import { toSelectedFileId } from "./to-selected-file-id.js";

const FILE_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b" as FileListItem["id"];
const SELECTION = { pathname: "/files/drive-1/folder/folder-2", fileId: FILE_ID };

describe("toSelectedFileId", () => {
  it("returns the selected file on the page where it was selected on a wide screen", () => {
    expect(toSelectedFileId(SELECTION, "/files/drive-1/folder/folder-2", false)).toBe(FILE_ID);
  });

  it("returns null when nothing is selected", () => {
    expect(toSelectedFileId(null, "/files/drive-1/folder/folder-2", false)).toBeNull();
  });

  it("returns null after the route has changed", () => {
    expect(toSelectedFileId(SELECTION, "/files/drive-1/folder/other", false)).toBeNull();
  });

  it("returns null on a narrow screen, where there is no details panel", () => {
    expect(toSelectedFileId(SELECTION, "/files/drive-1/folder/folder-2", true)).toBeNull();
  });
});
