// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const driveSwitcherStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: tokens.space[4],
  boxSizing: "border-box",
  padding: tokens.space[4],
  borderRadius: tokens.radius.lg,
  border: `1px solid ${cssVar("color-line")}`,
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  boxShadow: cssVar("elevation-1"),
  minWidth: 0,
};

export const driveSwitcherHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  paddingBottom: tokens.space[3],
  borderBottom: `1px solid ${cssVar("color-line")}`,
  minWidth: 0,
};

export const driveSwitcherTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const driveSwitcherCountStyle: CSSProperties = {
  flexShrink: 0,
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: cssVar("radius-full"),
  border: `1px solid ${cssVar("color-line")}`,
  background: cssVar("color-surface-low"),
  color: cssVar("color-muted"),
  fontFamily: cssVar("font-family-mono"),
};

export const driveSwitcherNavStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[4],
  minWidth: 0,
};

export const driveSwitcherErrorStyle: CSSProperties = {
  display: "grid",
  justifyItems: "start",
  gap: tokens.space[2],
};
