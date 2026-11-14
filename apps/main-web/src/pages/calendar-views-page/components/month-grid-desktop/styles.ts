// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { monthGridCardStyle, monthWeekdayRowStyle } from "../month-grid/styles.js";

export const desktopMonthCardStyle: CSSProperties = {
  ...monthGridCardStyle,
  gap: 0,
  padding: 0,
  maxHeight: "calc(100vh - 19rem)",
  overflow: "hidden",
};

export const desktopMonthScrollStyle: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  padding: `0 ${tokens.space[3]} ${tokens.space[3]}`,
};

export const desktopMonthWeekdayRowStyle: CSSProperties = {
  ...monthWeekdayRowStyle,
  gap: tokens.space[2],
  margin: `${tokens.space[3]} ${tokens.space[3]} ${tokens.space[2]}`,
  padding: `${tokens.space[2]} 0`,
  borderRadius: cssVar("radius-md"),
  background: cssVar("color-surface-high"),
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

export const desktopMonthWeekdayCellStyle: CSSProperties = {
  padding: `0 ${tokens.space[1]}`,
};

export const desktopMonthDaysGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: tokens.space[2],
};

export const desktopMonthCellStyle = (
  inMonth: boolean,
  today = false,
  selected = false,
): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: tokens.space[1],
  minWidth: 0,
  minHeight: "6.5rem",
  padding: tokens.space[2],
  borderRadius: cssVar("radius-md"),
  border: `1px solid ${cssVar("color-surface-high")}`,
  boxShadow: selected
    ? `inset 0 0 0 2px ${cssVar("color-primary")}, ${cssVar("elevation-1")}`
    : cssVar("elevation-1"),
  background: today
    ? cssVar("color-accent-soft")
    : inMonth
      ? cssVar("color-surface")
      : cssVar("color-surface-low"),
  color: inMonth ? cssVar("color-fg") : cssVar("color-muted"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
});

export const desktopMonthDayNumberStyle = (selected: boolean, today: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "flex-start",
  minWidth: "1.75rem",
  height: "1.75rem",
  padding: `0 ${tokens.space[1]}`,
  borderRadius: cssVar("radius-full"),
  background: today
    ? cssVar("color-primary")
    : selected
      ? cssVar("color-accent-soft")
      : "transparent",
  color: today ? cssVar("color-accent-fg") : selected ? cssVar("color-primary") : "inherit",
  fontWeight: selected || today ? cssVar("font-weight-semibold") : cssVar("font-weight-medium"),
});

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
  color: cssVar("color-primary"),
};
