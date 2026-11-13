// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const miniMonthStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  minWidth: 0,
};

export const miniMonthGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: `1.5rem repeat(7, minmax(0, 1fr))`,
  gap: tokens.space[1],
  alignItems: "center",
};

export const miniMonthWeekdayStyle: CSSProperties = {
  textAlign: "center",
  color: cssVar("color-muted"),
  fontSize: cssVar("font-size-label-sm"),
};

export const miniMonthWeekNumberStyle: CSSProperties = {
  textAlign: "center",
  color: cssVar("color-muted"),
  fontSize: cssVar("font-size-label-sm"),
};

// Today gets a ring so it stays visible when another day is selected. Days of other months are not dimmed:
// dimming them fails the contrast check.
export const miniMonthDayStyle = (today: boolean): CSSProperties => ({
  minWidth: 0,
  borderRadius: tokens.radius.full,
  boxShadow: today ? `inset 0 0 0 1px ${cssVar("color-accent")}` : "none",
});
