// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { findFolderPickerNode } from "./find-folder-picker-node.js";
import type { Drive, FileEntry, FolderPickerNode } from "./types.js";

const driveId = (value: string) => value as Drive["id"];
const fileId = (value: string) => value as FileEntry["id"];

const leaf: FolderPickerNode = {
  id: "inner",
  driveId: driveId("d"),
  folderId: fileId("inner"),
  label: "Inner",
  isDrive: false,
  hasChildren: true,
  disabled: false,
  isCurrent: false,
  caption: null,
};
const roots: readonly FolderPickerNode[] = [
  {
    ...leaf,
    id: "d",
    driveId: driveId("d"),
    folderId: null,
    label: "Drive",
    isDrive: true,
    children: [leaf],
  },
];

describe("findFolderPickerNode", () => {
  it("finds a node at any depth", () => {
    expect(findFolderPickerNode(roots, "inner")).toBe(leaf);
  });

  it("returns null for an unknown id", () => {
    expect(findFolderPickerNode(roots, "missing")).toBeNull();
  });
});
