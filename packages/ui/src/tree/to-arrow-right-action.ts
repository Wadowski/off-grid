// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TreeKeyAction, TreeKeyContext } from "./types.js";

export const toArrowRightAction = (context: TreeKeyContext): TreeKeyAction | null => {
  const current = context.visible[context.index];
  if (current === undefined) {
    return null;
  }
  const { node } = current;
  if (node.disabled || !node.hasChildren) {
    return null;
  }
  if (!context.expandedIds.has(node.id)) {
    return { type: "toggle", id: node.id };
  }
  const firstChild = context.visible[context.index + 1];
  return firstChild?.parentId === node.id ? { type: "focus", id: firstChild.node.id } : null;
};
