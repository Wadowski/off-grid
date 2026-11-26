// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const treeListStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const treeGroupStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const treeRowStyle = (
  depth: number,
  selected: boolean,
  disabled: boolean,
): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: cssVar("space-2"),
  minHeight: "2.75rem",
  paddingLeft: `calc(${cssVar("space-3")} + ${depth} * ${cssVar("space-5")})`,
  paddingRight: cssVar("space-3"),
  borderRadius: cssVar("radius-md"),
  background: selected ? cssVar("color-accent-soft") : "transparent",
  color: disabled ? cssVar("color-muted") : cssVar("color-fg"),
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.6 : 1,
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-body-md"),
});

export const treeChevronStyle = (expanded: boolean, visible: boolean): CSSProperties => ({
  display: "inline-flex",
  width: "1.25rem",
  justifyContent: "center",
  transform: expanded ? "rotate(90deg)" : "none",
  visibility: visible ? "visible" : "hidden",
});

export const treeLabelStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const treeRowFocusStyle = (focused: boolean): CSSProperties => ({
  boxShadow: focused ? `0 0 0 2px ${cssVar("color-accent")}` : "none",
});
