// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { TIMELINE_GUTTER } from "../../constants.js";

export const timelineBlockStyle = (
  topPx: number,
  heightPx: number,
  column: number,
  columnCount: number,
  options: { readonly desktop: boolean },
): CSSProperties => ({
  position: "absolute",
  top: `${topPx}px`,
  height: `${heightPx}px`,
  left: `calc(${TIMELINE_GUTTER} + (100% - ${TIMELINE_GUTTER}) * ${column} / ${columnCount} + 2px)`,
  width: `calc((100% - ${TIMELINE_GUTTER}) / ${columnCount} - 6px)`,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: tokens.space[1],
  padding: tokens.space[2],
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
  border: options.desktop ? `1px solid ${cssVar("color-line")}` : undefined,
  overflow: "hidden",
});

export const timelineBlockAccentStyle = (color: string): CSSProperties => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  width: "6px",
  background: color,
});

export const timelineBlockHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[1],
  minWidth: 0,
  paddingLeft: tokens.space[2],
};

export const timelineBlockTitleStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const timelineBlockRangeStyle: CSSProperties = {
  flexShrink: 0,
  padding: "2px 6px",
  borderRadius: cssVar("radius-sm"),
  background: cssVar("color-surface-low"),
  fontFamily: cssVar("font-family-mono"),
  fontSize: "10px",
  color: cssVar("color-muted"),
  whiteSpace: "nowrap",
};

export const timelineBlockFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  paddingLeft: tokens.space[2],
  minWidth: 0,
};

export const timelineBlockDurationStyle: CSSProperties = {
  flexShrink: 0,
  fontFamily: cssVar("font-family-base"),
  fontSize: "10px",
  color: cssVar("color-outline"),
};
