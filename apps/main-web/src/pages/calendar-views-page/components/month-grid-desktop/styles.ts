// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const desktopMonthCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  padding: tokens.space[3],
  maxHeight: "calc(100vh - 19rem)",
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
  overflow: "hidden",
};

export const desktopMonthScrollStyle: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
};

export const desktopMonthWeekdayRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: tokens.space[1],
  padding: `${tokens.space[2]} ${tokens.space[1]}`,
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface-low"),
};

export const desktopMonthWeekdayCellStyle: CSSProperties = {
  display: "block",
  textAlign: "center",
  fontWeight: cssVar("font-weight-semibold"),
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: cssVar("color-muted"),
};

export const desktopMonthWeekendWeekdayStyle: CSSProperties = {
  color: cssVar("color-primary"),
};

export const desktopMonthDaysGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: "0.375rem",
};

export const desktopMonthCellStyle = (
  inMonth: boolean,
  today = false,
  selected = false,
): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "space-between",
  gap: tokens.space[1],
  minWidth: 0,
  minHeight: "110px",
  padding: tokens.space[2],
  borderRadius: cssVar("radius-lg"),
  border: "none",
  boxShadow:
    today || selected
      ? `inset 0 0 0 2px ${cssVar("color-primary")}, ${cssVar("elevation-1")}`
      : inMonth
        ? cssVar("elevation-1")
        : "none",
  background: inMonth
    ? cssVar("color-surface")
    : `color-mix(in srgb, ${cssVar("color-surface-low")} 50%, transparent)`,
  color: inMonth ? cssVar("color-fg") : cssVar("color-muted"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
});

export const desktopMonthDayHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: tokens.space[1],
  minWidth: 0,
};

export const desktopMonthDotStyle: CSSProperties = {
  flexShrink: 0,
  width: "6px",
  height: "6px",
  marginTop: "0.25rem",
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-primary"),
};

export const desktopMonthDayNumberStyle = (selected: boolean, today: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.space[1],
  alignSelf: "flex-start",
  minWidth: today ? "auto" : "1.75rem",
  height: today ? "1.5rem" : "1.75rem",
  padding: today ? `0 ${tokens.space[2]}` : `0 ${tokens.space[1]}`,
  borderRadius: cssVar("radius-full"),
  background: today
    ? cssVar("color-primary")
    : selected
      ? cssVar("color-accent-soft")
      : "transparent",
  color: today ? cssVar("color-accent-fg") : selected ? cssVar("color-primary") : "inherit",
  fontWeight: selected || today ? cssVar("font-weight-semibold") : cssVar("font-weight-medium"),
});

export const desktopMonthTodayLabelStyle: CSSProperties = {
  fontSize: cssVar("font-size-label-sm"),
  fontWeight: cssVar("font-weight-semibold"),
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

export const desktopMonthChipListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  minWidth: 0,
};

export const desktopMonthMoreTextStyle: CSSProperties = {
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-medium"),
  color: cssVar("color-muted"),
  letterSpacing: "normal",
};
