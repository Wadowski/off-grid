// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { flattenVisibleNodes } from "./flatten-visible-nodes.js";
import { toTreeKeyAction } from "./to-tree-key-action.js";
import type { TreeNode } from "./types.js";

const leaf = (id: string, disabled = false): TreeNode => ({ id, label: id, icon: "folder", hasChildren: false, disabled });

const nodes: readonly TreeNode[] = [
  { id: "a", label: "a", icon: "folder", hasChildren: true, disabled: false, children: [leaf("a1"), leaf("a2", true)] },
  { id: "b", label: "b", icon: "folder", hasChildren: true, disabled: true, children: [leaf("b1")] },
];

const contextFor = (focusedId: string, expanded: string[]) => {
  const expandedIds = new Set(expanded);
  const visible = flattenVisibleNodes(nodes, expandedIds);
  return { visible, expandedIds, index: visible.findIndex((entry) => entry.node.id === focusedId) };
};

describe("toTreeKeyAction", () => {
  it("returns focus actions for the visible neighbours", () => {
    expect(toTreeKeyAction("ArrowDown", contextFor("a", ["a"]))).toEqual({ type: "focus", id: "a1" });
    expect(toTreeKeyAction("ArrowUp", contextFor("a1", ["a"]))).toEqual({ type: "focus", id: "a" });
    expect(toTreeKeyAction("ArrowUp", contextFor("a", []))).toBeNull();
  });

  it("returns toggle for ArrowRight on a collapsed node and focus of the first child when expanded", () => {
    expect(toTreeKeyAction("ArrowRight", contextFor("a", []))).toEqual({ type: "toggle", id: "a" });
    expect(toTreeKeyAction("ArrowRight", contextFor("a", ["a"]))).toEqual({ type: "focus", id: "a1" });
  });

  it("returns toggle for ArrowLeft on an expanded node and focus of the parent otherwise", () => {
    expect(toTreeKeyAction("ArrowLeft", contextFor("a", ["a"]))).toEqual({ type: "toggle", id: "a" });
    expect(toTreeKeyAction("ArrowLeft", contextFor("a1", ["a"]))).toEqual({ type: "focus", id: "a" });
    expect(toTreeKeyAction("ArrowLeft", contextFor("a", []))).toBeNull();
  });

  it("does not expand a disabled node", () => {
    expect(toTreeKeyAction("ArrowRight", contextFor("b", []))).toBeNull();
  });

  it("selects on Enter and Space but never a disabled node", () => {
    expect(toTreeKeyAction("Enter", contextFor("a1", ["a"]))).toEqual({ type: "select", id: "a1" });
    expect(toTreeKeyAction(" ", contextFor("a1", ["a"]))).toEqual({ type: "select", id: "a1" });
    expect(toTreeKeyAction("Enter", contextFor("b", []))).toBeNull();
  });

  it("returns null for keys the tree does not handle", () => {
    expect(toTreeKeyAction("a", contextFor("a", []))).toBeNull();
  });
});
