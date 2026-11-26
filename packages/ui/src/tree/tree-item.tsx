// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { MaterialIcon } from "../material-icon/material-icon.js";
import { Text } from "../text/text.js";
import {
  treeChevronStyle,
  treeGroupStyle,
  treeLabelStyle,
  treeRowFocusStyle,
  treeRowStyle,
} from "./styles.js";
import type { TreeItemProps } from "./types.js";

export const TreeItem = ({ node, depth, context }: TreeItemProps) => {
  const expanded = context.expandedIds.has(node.id) && !node.disabled;
  const selected = context.selectedId === node.id;
  const focused = context.focusedId === node.id;
  const togglable = node.hasChildren && !node.disabled;
  const toggle = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (togglable) {
      context.onToggle(node.id);
    }
  };
  const select = () => {
    if (!node.disabled) {
      context.onSelect(node.id);
    }
  };
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) {
      context.onItemKeyDown(event, node.id);
    }
  };
  const handleFocus = (event: { target: EventTarget; currentTarget: EventTarget }) => {
    if (event.target === event.currentTarget) {
      context.onItemFocus(node.id);
    }
  };
  const footer = context.renderFooter?.(node);
  const testId =
    context.nodeTestIdPrefix === undefined ? undefined : `${context.nodeTestIdPrefix}${node.id}`;

  return (
    <li
      role="treeitem"
      ref={(element) => context.registerItem(node.id, element)}
      aria-level={depth + 1}
      aria-selected={selected}
      aria-disabled={node.disabled ? true : undefined}
      aria-expanded={node.hasChildren ? expanded : undefined}
      tabIndex={focused ? 0 : -1}
      data-testid={testId}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      style={treeRowFocusStyle(focused)}
    >
      <div style={treeRowStyle(depth, selected, node.disabled)} onClick={select}>
        <span style={treeChevronStyle(expanded, togglable)} onClick={toggle}>
          <MaterialIcon name="chevron_right" size="1.25rem" color="currentColor" />
        </span>
        <MaterialIcon name={node.icon} size="1.25rem" color="currentColor" />
        <span style={treeLabelStyle}>
          <Text variant="body" element="span" value={node.label} />
        </span>
        {node.caption}
      </div>
      {expanded ? (
        <ul role="group" style={treeGroupStyle}>
          {(node.children ?? []).map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} context={context} />
          ))}
          {footer === undefined || footer === null ? null : <li role="none">{footer}</li>}
        </ul>
      ) : null}
    </li>
  );
};
