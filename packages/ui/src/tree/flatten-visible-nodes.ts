// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TreeNode, VisibleTreeNode } from "./types.js";

export const flattenVisibleNodes = (
  nodes: readonly TreeNode[],
  expandedIds: ReadonlySet<string>,
  depth = 0,
  parentId: string | null = null,
): VisibleTreeNode[] =>
  nodes.flatMap((node) => {
    const current: VisibleTreeNode = { node, depth, parentId };
    const showsChildren = expandedIds.has(node.id) && !node.disabled && node.children !== undefined;
    return showsChildren
      ? [current, ...flattenVisibleNodes(node.children ?? [], expandedIds, depth + 1, node.id)]
      : [current];
  });
