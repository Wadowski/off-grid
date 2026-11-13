// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarMultiSelectStyle: CSSProperties = {
  position: "relative",
  maxWidth: "100%",
};

export const calendarMultiSelectTriggerStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[1],
  maxWidth: "100%",
  padding: `${tokens.space[1]} ${tokens.space[3]}`,
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: cssVar("color-line"),
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  cursor: "pointer",
};

export const calendarMultiSelectPanelStyle: CSSProperties = {
  position: "absolute",
  top: `calc(100% + ${tokens.space[1]})`,
  right: 0,
  zIndex: 20,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  minWidth: "12rem",
  maxWidth: "calc(100vw - 2rem)",
  boxSizing: "border-box",
  padding: tokens.space[3],
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: cssVar("color-line"),
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
};

export const calendarMultiSelectDotStyle = (background: string): CSSProperties => ({
  display: "inline-block",
  width: "8px",
  height: "8px",
  marginRight: tokens.space[2],
  flexShrink: 0,
  borderRadius: cssVar("radius-full"),
  background,
});
