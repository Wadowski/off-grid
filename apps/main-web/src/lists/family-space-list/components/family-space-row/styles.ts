// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familySpaceCardStyle = (
  accent: string,
  active: boolean,
  selected: boolean,
): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: tokens.space[4],
  padding: tokens.space[4],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface"),
  boxShadow: selected ? cssVar("elevation-2") : cssVar("elevation-1"),
  borderStyle: "solid",
  borderWidth: "1px",
  borderColor: selected ? accent : "transparent",
  borderLeftWidth: "4px",
  borderLeftColor: active ? accent : selected ? accent : "transparent",
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
  // The ghost button colours its content muted; the space name stays at full text colour.
  color: cssVar("color-fg"),
};

export const familySpaceNameStyle: CSSProperties = {
  display: "grid",
  minWidth: 0,
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
