// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const driveSwitcherRowStyle = (active: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  alignItems: "center",
  gap: tokens.space[3],
  boxSizing: "border-box",
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.md,
  textDecoration: "none",
  color: cssVar("color-fg"),
  background: active ? cssVar("color-accent-soft") : "transparent",
  boxShadow: active ? `inset 0 0 0 2px ${cssVar("color-accent")}` : "none",
  minWidth: 0,
});

export const driveSwitcherRowNameStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
};
