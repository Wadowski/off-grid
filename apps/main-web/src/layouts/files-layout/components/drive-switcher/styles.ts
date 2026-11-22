// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const driveSwitcherStyle: CSSProperties = {
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
