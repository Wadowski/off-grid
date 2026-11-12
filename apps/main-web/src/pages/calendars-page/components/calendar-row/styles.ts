// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  minHeight: "3.5rem",
  minWidth: 0,
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.md,
  border: `1px solid ${cssVar("color-border")}`,
  color: cssVar("color-fg"),
  textDecoration: "none",
};

export const calendarRowTextStyle: CSSProperties = {
  display: "grid",
  flex: 1,
  minWidth: 0,
};

export const calendarRowNameStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const colorDotStyle = (background: string): CSSProperties => ({
  flexShrink: 0,
  width: "12px",
  height: "12px",
  borderRadius: tokens.radius.full,
  background,
});
