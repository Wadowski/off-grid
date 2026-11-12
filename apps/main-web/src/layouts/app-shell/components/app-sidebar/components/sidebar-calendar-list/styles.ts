// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarSectionStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  padding: `${tokens.space[3]} ${tokens.space[4]} 0`,
};

export const calendarListStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const calendarRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minHeight: "2rem",
  minWidth: 0,
  color: cssVar("color-fg"),
  textDecoration: "none",
};

export const calendarNameStyle: CSSProperties = {
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
