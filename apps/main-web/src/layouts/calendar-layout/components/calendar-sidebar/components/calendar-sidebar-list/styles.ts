// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarListStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const calendarRowStyle = (active: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
  minHeight: "2.25rem",
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: tokens.radius.md,
  color: cssVar("color-fg"),
  textDecoration: "none",
  background: active ? cssVar("color-surface-high") : "transparent",
});

export const calendarNameStyle: CSSProperties = {
  flex: "1 1 auto",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const colorDotStyle = (background: string): CSSProperties => ({
  flexShrink: 0,
  width: "10px",
  height: "10px",
  borderRadius: tokens.radius.full,
  background,
});
