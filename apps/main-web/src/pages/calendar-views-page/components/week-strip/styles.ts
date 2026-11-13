// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const weekStripStyle: CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  gap: tokens.space[1],
  padding: `${tokens.space[2]} ${tokens.space[1]}`,
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface-low"),
  boxShadow: cssVar("elevation-1"),
};

export const weekStripDayContentStyle = (selected: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: tokens.space[1],
  color: selected ? cssVar("color-accent-fg") : cssVar("color-fg"),
});

export const weekStripWeekdayStyle: CSSProperties = {
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  letterSpacing: cssVar("letter-spacing-label-sm"),
  fontWeight: cssVar("font-weight-medium"),
};

export const weekStripNumberStyle: CSSProperties = {
  fontFamily: cssVar("font-family-heading"),
  fontSize: cssVar("font-size-headline-sm"),
  lineHeight: cssVar("line-height-headline-sm"),
  letterSpacing: cssVar("letter-spacing-headline-sm"),
  fontWeight: cssVar("font-weight-semibold"),
};

export const weekStripTodayDotStyle = (selected: boolean): CSSProperties => ({
  width: "6px",
  height: "6px",
  borderRadius: cssVar("radius-full"),
  background: selected ? cssVar("color-accent-fg") : cssVar("color-good"),
});
