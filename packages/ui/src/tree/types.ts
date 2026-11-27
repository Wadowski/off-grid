// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";

export type TreeNode = {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly caption?: ReactNode;
  readonly hasChildren: boolean;
  readonly disabled: boolean;
  readonly children?: readonly TreeNode[];
};

export type TreeProps = {
  readonly label: string;
  readonly nodes: readonly TreeNode[];
  readonly expandedIds: ReadonlySet<string>;
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onToggle: (id: string) => void;
  readonly renderFooter?: (node: TreeNode) => ReactNode;
  readonly testId?: string;
  readonly nodeTestIdPrefix?: string;
};

export type VisibleTreeNode = {
  readonly node: TreeNode;
  readonly depth: number;
  readonly parentId: string | null;
};

export type TreeKeyAction =
  | { readonly type: "focus"; readonly id: string }
  | { readonly type: "select"; readonly id: string }
  | { readonly type: "toggle"; readonly id: string };

export type TreeKeyContext = {
  readonly visible: readonly VisibleTreeNode[];
  readonly index: number;
  readonly expandedIds: ReadonlySet<string>;
};

export type TreeItemContext = {
  readonly expandedIds: ReadonlySet<string>;
  readonly selectedId: string | null;
  readonly focusedId: string | null;
  readonly visible: readonly VisibleTreeNode[];
  readonly registerItem: (id: string, element: HTMLElement | null) => void;
  readonly onItemFocus: (id: string) => void;
  readonly onItemKeyDown: (event: ReactKeyboardEvent<HTMLElement>, id: string) => void;
  readonly onSelect: (id: string) => void;
  readonly onToggle: (id: string) => void;
  readonly renderFooter?: (node: TreeNode) => ReactNode;
  readonly nodeTestIdPrefix?: string;
};

export type TreeItemProps = {
  readonly node: TreeNode;
  readonly depth: number;
  readonly context: TreeItemContext;
};
