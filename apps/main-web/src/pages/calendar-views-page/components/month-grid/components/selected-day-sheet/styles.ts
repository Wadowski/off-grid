// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const selectedDaySheetStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
};

export const selectedDaySheetGrabberStyle: CSSProperties = {
  width: "2.5rem",
  height: "4px",
  margin: "0 auto",
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-line"),
};

export const selectedDaySheetHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  minWidth: 0,
};

export const selectedDaySheetCountStyle: CSSProperties = {
  flexShrink: 0,
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-accent-soft"),
  color: cssVar("color-primary"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-sm"),
  lineHeight: cssVar("line-height-label-sm"),
  fontWeight: cssVar("font-weight-semibold"),
};

export const selectedDaySheetBodyStyle: CSSProperties = {
  maxHeight: "22rem",
  overflowY: "auto",
};
