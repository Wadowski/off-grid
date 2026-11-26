// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toTrashRoots } from "./to-trash-roots.js";
import type { FileListItem } from "./types.js";

const itemOf = (id: string, parentId: string | null): FileListItem =>
  ({ id, parentId, name: id, isFolder: false }) as FileListItem;

describe("toTrashRoots", () => {
  it("keeps items at the top of the drive and items whose parent is not in the trash", () => {
    const items = [itemOf("top", null), itemOf("child", "live-parent")];

    expect(toTrashRoots(items).map((item) => item.id)).toEqual(["top", "child"]);
  });

  it("drops an item whose parent is also in the trash, even when the parent comes later", () => {
    const items = [itemOf("child", "folder"), itemOf("top", null), itemOf("folder", null)];

    expect(toTrashRoots(items).map((item) => item.id)).toEqual(["top", "folder"]);
  });

  it("keeps the order the items were given in", () => {
    const items = [itemOf("b", null), itemOf("a", null), itemOf("c", "b")];

    expect(toTrashRoots(items).map((item) => item.id)).toEqual(["b", "a"]);
  });
});
