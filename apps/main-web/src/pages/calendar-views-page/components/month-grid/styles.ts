// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const monthSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
};

export const monthGridCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  padding: tokens.space[3],
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
};

export const monthWeekdayRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  textAlign: "center",
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-semibold"),
  color: cssVar("color-muted"),
};

export const monthDaysGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  rowGap: tokens.space[1],
  textAlign: "center",
};

export const monthDayCellStyle = (inMonth: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "2px",
  minHeight: "2.5rem",
  padding: 0,
  borderWidth: 0,
  background: "transparent",
  color: inMonth ? cssVar("color-fg") : cssVar("color-muted"),
  opacity: inMonth ? 1 : 0.5,
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
  cursor: inMonth ? "pointer" : "default",
});

export const monthDayNumberStyle = (selected: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: cssVar("radius-full"),
  background: selected ? cssVar("color-primary") : "transparent",
  color: selected ? cssVar("color-accent-fg") : "inherit",
  fontWeight: selected ? cssVar("font-weight-semibold") : cssVar("font-weight-medium"),
});

export const monthDotRowStyle: CSSProperties = {
  display: "flex",
  gap: "2px",
  height: "4px",
};

export const monthDotStyle = (color: string): CSSProperties => ({
  width: "4px",
  height: "4px",
  borderRadius: cssVar("radius-full"),
  background: color,
});
