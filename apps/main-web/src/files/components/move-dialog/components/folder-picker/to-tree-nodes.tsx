// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TreeNode } from "@offgrid/ui";
import { FolderPickerCaption } from "./folder-picker-caption.js";
import type { FolderPickerNode } from "../../../../types.js";

export const toTreeNodes = (nodes: readonly FolderPickerNode[]): TreeNode[] =>
  nodes.map((node) => ({
    id: node.id,
    label: node.label,
    icon: node.isDrive ? "hard_drive" : "folder",
    hasChildren: node.hasChildren,
    disabled: node.disabled,
    caption: node.caption === null ? null : <FolderPickerCaption caption={node.caption} />,
    children: node.children === undefined ? undefined : toTreeNodes(node.children),
  }));
