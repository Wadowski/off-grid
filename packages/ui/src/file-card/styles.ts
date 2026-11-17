// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const fileCardStyle = (selected: boolean): CSSProperties => ({
  position: "relative",
  minWidth: "10rem",
  overflow: "hidden",
  borderRadius: cssVar("radius-lg"),
  border: `1px solid ${cssVar("color-line")}`,
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  boxShadow: selected ? `0 0 0 2px ${cssVar("color-accent")}` : "none",
});

export const fileCardActivatorStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: cssVar("radius-lg"),
};

export const fileCardMediaStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  placeItems: "center",
  minHeight: "7.5rem",
  background: cssVar("color-surface-2"),
};

export const fileCardBadgeStyle = (kindColor: string): CSSProperties => ({
  position: "absolute",
  top: cssVar("space-2"),
  left: cssVar("space-2"),
  padding: `0 ${cssVar("space-2")}`,
  borderRadius: cssVar("radius-full"),
  background: kindColor,
  color: cssVar("color-bg"),
});

export const fileCardBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-1"),
  minWidth: 0,
  padding: cssVar("space-3"),
};

export const fileCardFolderBodyStyle: CSSProperties = {
  ...fileCardBodyStyle,
  gap: cssVar("space-3"),
  padding: cssVar("space-4"),
};

export const fileCardTrailingStyle: CSSProperties = {
  position: "absolute",
  top: cssVar("space-2"),
  right: cssVar("space-2"),
  display: "flex",
  alignItems: "center",
};
