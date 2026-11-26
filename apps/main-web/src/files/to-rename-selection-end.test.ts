// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toRenameSelectionEnd } from "./to-rename-selection-end.js";
import type { FileListItem } from "./types.js";

const fileNamed = (name: string) => ({ isFolder: false, name }) as FileListItem;
const folderNamed = (name: string) => ({ isFolder: true, name }) as FileListItem;

describe("toRenameSelectionEnd", () => {
  it("selects the base name of a file, leaving the extension out", () => {
    expect(toRenameSelectionEnd(fileNamed("Insurance policy.txt"))).toBe(16);
  });

  it("selects the whole name of a file with several dots only up to the last dot", () => {
    expect(toRenameSelectionEnd(fileNamed("archive.tar.gz"))).toBe(11);
  });

  it("selects the whole name of a file without an extension", () => {
    expect(toRenameSelectionEnd(fileNamed("README"))).toBe(6);
  });

  it("selects the whole name of a dotfile", () => {
    expect(toRenameSelectionEnd(fileNamed(".gitignore"))).toBe(10);
  });

  it("selects the whole name of a folder, even one with a dot", () => {
    expect(toRenameSelectionEnd(folderNamed("Trip 2.0"))).toBe(8);
  });
});
