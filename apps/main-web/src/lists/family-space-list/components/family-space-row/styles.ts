// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familySpaceCardStyle = (accent: string, active: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: tokens.space[4],
  padding: tokens.space[4],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
  borderLeftStyle: "solid",
  borderLeftWidth: "4px",
  borderLeftColor: active ? accent : "transparent",
});

export const familySpaceHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: tokens.space[2],
};

export const familySpaceIdentityStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  minWidth: 0,
};

export const familySpaceNameStyle: CSSProperties = {
  display: "grid",
  minWidth: 0,
};

export const familySpaceRolePillStyle: CSSProperties = {
  flexShrink: 0,
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: tokens.radius.full,
  background: cssVar("color-surface-high"),
};

export const familySpaceFooterStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  paddingTop: tokens.space[3],
  borderTopStyle: "solid",
  borderTopWidth: "1px",
  borderTopColor: cssVar("color-surface-high"),
};
