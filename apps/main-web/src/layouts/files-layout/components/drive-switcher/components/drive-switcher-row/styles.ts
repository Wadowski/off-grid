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
  padding: `${tokens.space[2]} ${tokens.space[2]}`,
  borderRadius: tokens.radius.lg,
  textDecoration: "none",
  color: cssVar("color-fg"),
  background: active
    ? `color-mix(in srgb, ${cssVar("color-primary")} 6%, transparent)`
    : cssVar("color-surface-low"),
  boxShadow: active ? `inset 0 0 0 2px ${cssVar("color-primary")}` : "none",
  minWidth: 0,
});

export const driveSwitcherRowTextStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const driveSwitcherRowNameStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
  fontWeight: cssVar("font-weight-semibold"),
};

export const driveSwitcherRowActiveTextStyle: CSSProperties = {
  flexShrink: 0,
  padding: `0 ${tokens.space[1]}`,
  borderRadius: cssVar("radius-full"),
  background: `color-mix(in srgb, ${cssVar("color-good")} 15%, transparent)`,
  color: cssVar("color-good"),
};
