// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { WEEK_GUTTER, WEEK_HOUR_PX } from "./constants.js";

export const weekGridScrollStyle: CSSProperties = {
  height: "32rem",
  overflowY: "auto",
  overflowX: "hidden",
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface-low"),
};

export const weekHeaderRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: `${WEEK_GUTTER} repeat(7, minmax(0, 1fr))`,
  alignItems: "stretch",
  position: "sticky",
  top: 0,
  zIndex: 2,
  background: cssVar("color-surface"),
};

export const weekGutterLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  paddingBottom: tokens.space[1],
  fontFamily: cssVar("font-family-mono"),
  fontSize: "9px",
  color: cssVar("color-muted"),
};

export const weekDayHeaderStyle = (today: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
  padding: `${tokens.space[1]} 0`,
  color: today ? cssVar("color-primary") : cssVar("color-muted"),
  fontFamily: cssVar("font-family-base"),
  fontSize: "10px",
  fontWeight: cssVar("font-weight-medium"),
});

export const weekDayNumberStyle = (selected: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  borderRadius: cssVar("radius-full"),
  background: selected ? cssVar("color-primary") : "transparent",
  color: selected ? cssVar("color-accent-fg") : cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: "13px",
  fontWeight: cssVar("font-weight-semibold"),
});

export const weekTodayDotStyle: CSSProperties = {
  width: "4px",
  height: "4px",
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-good"),
};

export const weekAllDayRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: `${WEEK_GUTTER} repeat(7, minmax(0, 1fr))`,
  gap: "2px 0",
  padding: `${tokens.space[1]} 0`,
};

export const weekAllDayBarStyle = (color: string): CSSProperties => ({
  minWidth: 0,
  margin: "0 2px",
  padding: "2px 4px",
  borderRadius: cssVar("radius-sm"),
  background: `${color}33`,
  borderLeft: `2px solid ${color}`,
  color,
  fontFamily: cssVar("font-family-base"),
  fontSize: "9px",
  fontWeight: cssVar("font-weight-semibold"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const weekBodyStyle = (heightPx: number): CSSProperties => ({
  position: "relative",
  display: "grid",
  gridTemplateColumns: `${WEEK_GUTTER} repeat(7, minmax(0, 1fr))`,
  height: `${heightPx}px`,
});

export const weekHourLabelStyle = (hourIndex: number): CSSProperties => ({
  position: "absolute",
  top: `${hourIndex * WEEK_HOUR_PX - 6}px`,
  right: tokens.space[1],
  fontFamily: cssVar("font-family-mono"),
  fontSize: "9px",
  color: cssVar("color-muted"),
});

export const weekHourLineStyle = (hourIndex: number): CSSProperties => ({
  position: "absolute",
  left: WEEK_GUTTER,
  right: 0,
  top: `${hourIndex * WEEK_HOUR_PX}px`,
  height: "1px",
  background: cssVar("color-line"),
  opacity: 0.5,
});

export const weekColumnStyle: CSSProperties = {
  position: "relative",
  borderLeft: `1px solid ${cssVar("color-line")}`,
  minWidth: 0,
};

export const weekBlockStyle = (
  topPx: number,
  heightPx: number,
  column: number,
  columnCount: number,
  color: string,
): CSSProperties => ({
  position: "absolute",
  top: `${topPx}px`,
  height: `${heightPx}px`,
  left: `calc(${(column * 100) / columnCount}% + 1px)`,
  width: `calc(${100 / columnCount}% - 2px)`,
  boxSizing: "border-box",
  padding: "2px 3px",
  overflow: "hidden",
  borderRadius: cssVar("radius-sm"),
  borderLeft: `2px solid ${color}`,
  background: `${color}26`,
  color: cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: "9px",
  lineHeight: "11px",
});

export const weekBlockTitleStyle: CSSProperties = {
  fontWeight: cssVar("font-weight-semibold"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const weekBlockTimeStyle: CSSProperties = {
  fontFamily: cssVar("font-family-mono"),
  fontSize: "8px",
  color: cssVar("color-muted"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const weekNowDotStyle: CSSProperties = {
  width: "8px",
  height: "8px",
  marginLeft: "-4px",
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-danger"),
};

export const weekNowLineStyle: CSSProperties = {
  flex: 1,
  height: "2px",
  background: cssVar("color-danger"),
};

export const weekNowStyle = (topPx: number): CSSProperties => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: `${topPx}px`,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
});
