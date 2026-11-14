// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const desktopMonthCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
  overflow: "hidden",
};

export const desktopMonthWeekdayRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  borderBottom: `1px solid ${cssVar("color-line")}`,
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-semibold"),
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: cssVar("color-muted"),
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
  minHeight: "7.5rem",
  padding: tokens.space[2],
  borderBottom: `1px solid ${cssVar("color-line")}`,
  borderRight: `1px solid ${cssVar("color-line")}`,
  background: inMonth ? cssVar("color-surface") : cssVar("color-surface-low"),
  color: inMonth ? cssVar("color-fg") : cssVar("color-muted"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
});

export const desktopMonthDayNumberStyle = (selected: boolean, today: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "flex-start",
  width: "1.75rem",
  height: "1.75rem",
  padding: 0,
  borderWidth: 0,
  borderRadius: cssVar("radius-full"),
  background: selected ? cssVar("color-primary") : "transparent",
  color: selected ? cssVar("color-accent-fg") : "inherit",
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: today || selected ? cssVar("font-weight-semibold") : cssVar("font-weight-medium"),
  cursor: "pointer",
});

export const desktopMonthChipListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  minWidth: 0,
};

export const desktopMonthMoreStyle: CSSProperties = {
  padding: 0,
  borderWidth: 0,
  background: "transparent",
  textAlign: "left",
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-medium"),
  color: cssVar("color-primary"),
  cursor: "pointer",
};
