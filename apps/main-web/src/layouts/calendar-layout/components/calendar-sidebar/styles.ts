// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

// The top offset clears the fixed app header (3.5rem) and the page's top spacing.
export const calendarSidebarStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  alignSelf: "start",
  position: "sticky",
  top: `calc(3.5rem + ${tokens.space[4]})`,
  gap: tokens.space[3],
  boxSizing: "border-box",
  padding: `${tokens.space[4]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  boxShadow: cssVar("elevation-1"),
  minWidth: 0,
};

export const calendarSidebarSlotStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
};

export const manageCalendarsLinkStyle: CSSProperties = {
  justifySelf: "start",
  textDecoration: "none",
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: tokens.radius.md,
};
