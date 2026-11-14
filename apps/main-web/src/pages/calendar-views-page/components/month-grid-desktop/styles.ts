// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { monthGridCardStyle, monthWeekdayRowStyle } from "../month-grid/styles.js";

// The card never grows past the window: the day rows scroll inside it, so the footer bar cannot
// cover the last week. 19rem is the height above the grid (page header, navigation) plus the
// footer bar and the page's bottom padding.
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
};

export const desktopMonthWeekdayRowStyle: CSSProperties = {
  ...monthWeekdayRowStyle,
  textAlign: "left",
  borderBottom: `1px solid ${cssVar("color-line")}`,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

export const desktopMonthWeekdayCellStyle: CSSProperties = {
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
};

export const desktopMonthDaysGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
};

export const desktopMonthCellStyle = (inMonth: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: tokens.space[1],
  minWidth: 0,
  minHeight: "6.5rem",
  padding: tokens.space[2],
  borderBottom: `1px solid ${cssVar("color-line")}`,
  borderRight: `1px solid ${cssVar("color-line")}`,
  background: inMonth ? cssVar("color-surface") : cssVar("color-surface-low"),
  color: inMonth ? cssVar("color-fg") : cssVar("color-muted"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
});

export const desktopMonthChipListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  minWidth: 0,
};

export const desktopMonthMoreTextStyle: CSSProperties = {
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-medium"),
  color: cssVar("color-primary"),
};
