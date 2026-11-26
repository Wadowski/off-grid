// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { flattenVisibleNodes } from "./flatten-visible-nodes.js";
import type { TreeNode } from "./types.js";

const nodes: readonly TreeNode[] = [
  { id: "a", label: "a", icon: "folder", hasChildren: true, disabled: false, children: [{ id: "a1", label: "a1", icon: "folder", hasChildren: false, disabled: false }] },
  { id: "b", label: "b", icon: "folder", hasChildren: true, disabled: true, children: [{ id: "b1", label: "b1", icon: "folder", hasChildren: false, disabled: false }] },
  { id: "c", label: "c", icon: "folder", hasChildren: true, disabled: false },
];

describe("flattenVisibleNodes", () => {
  it("lists children only of expanded nodes that are loaded and enabled", () => {
    const visible = flattenVisibleNodes(nodes, new Set(["a", "b", "c"]));

    expect(visible.map((entry) => [entry.node.id, entry.depth, entry.parentId])).toEqual([
      ["a", 0, null],
      ["a1", 1, "a"],
      ["b", 0, null],
      ["c", 0, null],
    ]);
  });
});
