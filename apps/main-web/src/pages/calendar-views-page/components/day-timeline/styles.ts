// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import {
  HOUR_HEIGHT_PX,
  HOURS_PER_DAY,
  TIMELINE_GUTTER,
  TIMELINE_TOP_OFFSET_PX,
} from "./constants.js";

export const timelineScrollStyle: CSSProperties = {
  position: "relative",
  height: "32rem",
  overflowY: "auto",
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface-low"),
};

export const timelineCanvasStyle: CSSProperties = {
  position: "relative",
  height: `${HOUR_HEIGHT_PX * HOURS_PER_DAY + TIMELINE_TOP_OFFSET_PX * 2}px`,
};

export const timelineHourRowStyle = (hour: number): CSSProperties => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: `${TIMELINE_TOP_OFFSET_PX + hour * HOUR_HEIGHT_PX}px`,
  height: `${HOUR_HEIGHT_PX}px`,
  display: "flex",
  alignItems: "flex-start",
});

export const timelineHourLabelStyle: CSSProperties = {
  width: TIMELINE_GUTTER,
  flexShrink: 0,
  paddingLeft: tokens.space[1],
  paddingRight: tokens.space[2],
  textAlign: "right",
  fontFamily: cssVar("font-family-mono"),
  fontSize: "11px",
  lineHeight: cssVar("line-height-mono-code"),
  color: cssVar("color-muted"),
};

export const timelineHourLineStyle: CSSProperties = {
  flex: 1,
  height: "1px",
  marginTop: tokens.space[2],
  background: cssVar("color-line"),
};

export const timelineNowStyle = (top: number): CSSProperties => ({
  position: "absolute",
  left: `calc(${TIMELINE_GUTTER} + ${tokens.space[1]})`,
  right: tokens.space[2],
  top: `${top}px`,
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
});

export const timelineNowDotStyle: CSSProperties = {
  width: "10px",
  height: "10px",
  marginLeft: "-5px",
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-danger"),
};

export const timelineNowLineStyle: CSSProperties = {
  flex: 1,
  height: "2px",
  background: cssVar("color-danger"),
};

export const timelineNowBadgeStyle: CSSProperties = {
  marginLeft: tokens.space[2],
  padding: "2px 6px",
  borderRadius: cssVar("radius-sm"),
  background: cssVar("color-danger"),
  color: cssVar("color-accent-fg"),
  fontFamily: cssVar("font-family-mono"),
  fontSize: "10px",
  fontWeight: cssVar("font-weight-semibold"),
};

export const timelineAllDayRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: tokens.space[1],
  paddingBottom: tokens.space[2],
};

export const timelineAllDayChipStyle = (color: string): CSSProperties => ({
  maxWidth: "100%",
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: cssVar("radius-full"),
  background: `${color}26`,
  color,
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-medium"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
