// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { calendarTintBackground } from "../../../../../../calendars/calendar-accents.js";

export const monthEventChipStyle = (color: string): CSSProperties => ({
  display: "block",
  maxWidth: "100%",
  padding: `2px ${tokens.space[2]}`,
  borderLeft: `4px solid ${color}`,
  borderRadius: cssVar("radius-md"),
  background: calendarTintBackground(color),
  color: cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-medium"),
  textAlign: "left",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const monthEventChipButtonStyle: CSSProperties = {
  display: "block",
  maxWidth: "100%",
  padding: 0,
  border: 0,
  background: "none",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
};
