// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { VisibleTreeNode } from "./types.js";

export const resolveActiveId = (
  focusedId: string | null,
  selectedId: string | null,
  visible: readonly VisibleTreeNode[],
): string | null => {
  const isVisible = (id: string | null) => id !== null && visible.some((entry) => entry.node.id === id);
  if (isVisible(focusedId)) {
    return focusedId;
  }
  if (isVisible(selectedId)) {
    return selectedId;
  }
  return visible[0]?.node.id ?? null;
};
