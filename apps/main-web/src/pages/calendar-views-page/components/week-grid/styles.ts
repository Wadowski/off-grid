// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import type { WeekAccent } from "./components/week-event-block/types.js";
import type { WeekCardStyle, WeekGridSize } from "./constants.js";

// Room past the last day column for the desktop now-line time badge.
const DESKTOP_NOW_BADGE_GUTTER = "4.25rem";

export const weekGridScrollStyle = (scrollHeight: string, desktop = false): CSSProperties => ({
  height: scrollHeight,
  overflowY: "auto",
  overflowX: "hidden",
  borderRadius: cssVar("radius-lg"),
  background: desktop ? cssVar("color-surface") : cssVar("color-surface-low"),
  paddingRight: desktop ? DESKTOP_NOW_BADGE_GUTTER : undefined,
});

export const weekHeaderRowStyle = (gutter: string): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `${gutter} repeat(7, minmax(0, 1fr))`,
  alignItems: "stretch",
  position: "sticky",
  top: 0,
  zIndex: 2,
  background: cssVar("color-surface"),
});

export const weekGutterLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  paddingBottom: tokens.space[1],
  fontFamily: cssVar("font-family-mono"),
  fontSize: "9px",
  color: cssVar("color-muted"),
};

export const weekDayHeaderStyle = (today: boolean, desktop = false): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: desktop ? tokens.space[1] : "2px",
  padding: desktop ? `${tokens.space[2]} 0 ${tokens.space[1]}` : `${tokens.space[1]} 0`,
  color: today ? cssVar("color-primary") : cssVar("color-muted"),
  fontFamily: cssVar("font-family-base"),
  fontSize: desktop ? tokens.font.size["label-sm"] : "10px",
  fontWeight: cssVar("font-weight-medium"),
  letterSpacing: desktop ? "0.08em" : undefined,
  textTransform: desktop ? "uppercase" : undefined,
});

export const weekDayNumberStyle = (selected: boolean, desktop = false): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: desktop ? "1.75rem" : "1.5rem",
  height: desktop ? "1.75rem" : "1.5rem",
  borderRadius: cssVar("radius-full"),
  background: selected ? cssVar("color-primary") : "transparent",
  color: selected ? cssVar("color-accent-fg") : cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: desktop ? tokens.font.size["headline-sm"] : "13px",
  fontWeight: cssVar("font-weight-semibold"),
});

export const weekTodayDotStyle: CSSProperties = {
  width: "4px",
  height: "4px",
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-good"),
};

export const weekAllDayRowStyle = (gutter: string): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `${gutter} repeat(7, minmax(0, 1fr))`,
  gap: "2px 0",
  padding: `${tokens.space[1]} 0`,
});

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

export const weekBodyStyle = (heightPx: number, gutter: string): CSSProperties => ({
  position: "relative",
  display: "grid",
  gridTemplateColumns: `${gutter} repeat(7, minmax(0, 1fr))`,
  height: `${heightPx}px`,
});

export const weekHourLabelStyle = (
  hourIndex: number,
  hourPx: number,
  desktop = false,
): CSSProperties => ({
  position: "absolute",
  top: `${hourIndex * hourPx - 6}px`,
  right: tokens.space[1],
  fontFamily: cssVar("font-family-mono"),
  fontSize: desktop ? tokens.font.size["label-sm"] : "9px",
  color: cssVar("color-muted"),
});

export const weekHourLineStyle = (hourIndex: number, size: WeekGridSize): CSSProperties => ({
  position: "absolute",
  left: size.gutter,
  right: 0,
  top: `${hourIndex * size.hourPx}px`,
  height: "1px",
  background: cssVar("color-line"),
  opacity: 0.5,
});

const phoneWeekColumnStyle: CSSProperties = {
  position: "relative",
  borderLeft: `1px solid ${cssVar("color-line")}`,
  minWidth: 0,
};

// Desktop columns share one panel; only faint separators and today's tint are drawn.
const desktopWeekColumnStyle = (today: boolean): CSSProperties => ({
  position: "relative",
  minWidth: 0,
  borderLeft: `1px solid ${cssVar("color-surface-high")}`,
  background: today
    ? `color-mix(in srgb, ${cssVar("color-accent")} 8%, ${cssVar("color-surface")})`
    : undefined,
});

export const weekColumnStyle = (card: WeekCardStyle, today = false): CSSProperties =>
  card === "detailed" ? desktopWeekColumnStyle(today) : phoneWeekColumnStyle;

export const weekDesktopDayCellStyle: CSSProperties = {
  minWidth: 0,
  padding: `${tokens.space[2]} ${tokens.space[2]} ${tokens.space[1]}`,
  color: cssVar("color-fg"),
  display: "flex",
  alignItems: "center",
  gap: tokens.space[1],
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

export const weekDetailedBlockStyle = (
  topPx: number,
  heightPx: number,
  column: number,
  columnCount: number,
  accent: WeekAccent,
): CSSProperties => ({
  ...weekBlockStyle(topPx, heightPx, column, columnCount, accent.background),
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  padding: tokens.space[2],
  background: `${accent.background}33`,
  borderLeft: `3px solid ${accent.background}`,
  borderRadius: cssVar("radius-md"),
  boxShadow: cssVar("elevation-1"),
  color: cssVar("color-fg"),
  fontSize: tokens.font.size["body-sm"],
  lineHeight: tokens.font.lineHeight["body-sm"],
  letterSpacing: tokens.font.letterSpacing["body-sm"],
});

export const weekDetailedShortBlockStyle = (
  topPx: number,
  heightPx: number,
  column: number,
  columnCount: number,
  accent: WeekAccent,
): CSSProperties => ({
  ...weekBlockStyle(topPx, heightPx, column, columnCount, accent.background),
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "2px 6px",
  background: `${accent.background}33`,
  borderLeft: `3px solid ${accent.background}`,
  borderRadius: cssVar("radius-md"),
  boxShadow: cssVar("elevation-1"),
  color: cssVar("color-fg"),
  fontSize: tokens.font.size["body-md"],
  lineHeight: tokens.font.lineHeight["label-md"],
});

export const weekDetailedShortTitleStyle: CSSProperties = {
  fontWeight: cssVar("font-weight-semibold"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const weekDetailedShortRangeStyle: CSSProperties = {
  fontFamily: cssVar("font-family-mono"),
  fontSize: tokens.font.size["label-sm"],
  lineHeight: tokens.font.lineHeight["label-sm"],
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const weekDetailedTitleStyle: CSSProperties = {
  fontSize: tokens.font.size["body-md"],
  lineHeight: tokens.font.lineHeight["body-md"],
  fontWeight: cssVar("font-weight-semibold"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const weekDetailedRangeStyle: CSSProperties = {
  fontFamily: cssVar("font-family-mono"),
  fontSize: tokens.font.size["label-sm"],
  lineHeight: tokens.font.lineHeight["label-sm"],
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const weekLocationChipStyle = (accent: WeekAccent): CSSProperties => ({
  alignSelf: "flex-start",
  maxWidth: "100%",
  padding: `0 ${tokens.space[2]}`,
  borderRadius: cssVar("radius-full"),
  background: `${accent.background}66`,
  color: accent.color,
  fontSize: tokens.font.size["label-md"],
  fontWeight: cssVar("font-weight-semibold"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

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

export const weekNowBadgeStyle: CSSProperties = {
  flexShrink: 0,
  padding: "1px 4px",
  borderRadius: cssVar("radius-sm"),
  background: cssVar("color-danger"),
  color: cssVar("color-accent-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: "10px",
  fontWeight: cssVar("font-weight-semibold"),
  whiteSpace: "nowrap",
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

// Desktop: one line across all day columns, starting at the gutter dot.
// The height is zero so the flex children are centred on the line.
export const weekNowOverlayStyle = (topPx: number): CSSProperties => ({
  ...weekNowStyle(topPx),
  height: 0,
});

export const weekNowGutterStyle = (gutter: string): CSSProperties => ({
  flexShrink: 0,
  width: gutter,
});

// Sits just past the right edge of the last day column, centred on the line.
export const weekNowOverlayBadgeStyle: CSSProperties = {
  ...weekNowBadgeStyle,
  position: "absolute",
  left: "100%",
  top: "50%",
  marginLeft: tokens.space[1],
  transform: "translateY(-50%)",
  fontFamily: cssVar("font-family-base"),
  fontSize: tokens.font.size["label-sm"],
};
