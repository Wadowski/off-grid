// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { flattenVisibleNodes } from "./flatten-visible-nodes.js";
import { resolveActiveId } from "./resolve-active-id.js";
import { toTreeKeyAction } from "./to-tree-key-action.js";
import { TreeItem } from "./tree-item.js";
import { treeListStyle } from "./styles.js";
import type { TreeItemContext, TreeProps } from "./types.js";

export const Tree = ({ label, nodes, expandedIds, selectedId, onSelect, onToggle, renderFooter, testId, nodeTestIdPrefix }: TreeProps) => {
  const visible = useMemo(() => flattenVisibleNodes(nodes, expandedIds), [nodes, expandedIds]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const activeId = resolveActiveId(focusedId, selectedId, visible);

  const registerItem = useCallback((id: string, element: HTMLElement | null) => {
    if (element === null) {
      elements.current.delete(id);
      return;
    }
    elements.current.set(id, element);
  }, []);

  const focusItem = (id: string) => {
    setFocusedId(id);
    elements.current.get(id)?.focus();
  };

  const onItemKeyDown = (event: ReactKeyboardEvent<HTMLElement>, id: string) => {
    const index = visible.findIndex((entry) => entry.node.id === id);
    const action = toTreeKeyAction(event.key, { visible, index, expandedIds });
    if (action === null) {
      return;
    }
    event.preventDefault();
    if (action.type === "focus") {
      focusItem(action.id);
    } else if (action.type === "select") {
      onSelect(action.id);
    } else {
      onToggle(action.id);
    }
  };

  const context: TreeItemContext = {
    expandedIds,
    selectedId,
    focusedId: activeId,
    visible,
    registerItem,
    onItemFocus: setFocusedId,
    onItemKeyDown,
    onSelect,
    onToggle,
    renderFooter,
    nodeTestIdPrefix,
  };

  return (
    <ul role="tree" aria-label={label} data-testid={testId} style={treeListStyle}>
      {nodes.map((node) => (
        <TreeItem key={node.id} node={node} depth={0} context={context} />
      ))}
    </ul>
  );
};
