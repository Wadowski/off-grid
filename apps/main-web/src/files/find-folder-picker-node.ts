// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FolderPickerNode } from "./types.js";

export const findFolderPickerNode = (
  nodes: readonly FolderPickerNode[],
  id: string,
): FolderPickerNode | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = node.children === undefined ? null : findFolderPickerNode(node.children, id);
    if (found !== null) {
      return found;
    }
  }
  return null;
};
