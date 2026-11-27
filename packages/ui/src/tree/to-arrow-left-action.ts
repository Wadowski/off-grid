// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TreeKeyAction, TreeKeyContext } from "./types.js";

export const toArrowLeftAction = (context: TreeKeyContext): TreeKeyAction | null => {
  const current = context.visible[context.index];
  if (current === undefined) {
    return null;
  }
  if (context.expandedIds.has(current.node.id) && current.node.hasChildren) {
    return { type: "toggle", id: current.node.id };
  }
  return current.parentId === null ? null : { type: "focus", id: current.parentId };
};
