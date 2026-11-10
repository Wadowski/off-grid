// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const rosterRowStyle = (divided: boolean): CSSProperties => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderTopStyle: divided ? "solid" : "none",
  borderTopWidth: "1px",
  borderTopColor: cssVar("color-surface-high"),
});

export const rosterIdentityStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  minWidth: 0,
};

export const rosterNameStyle: CSSProperties = {
  display: "grid",
  minWidth: 0,
};

export const rosterNameLineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};

export const rosterSelectStyle: CSSProperties = {
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: tokens.radius.md,
  borderStyle: "solid",
  borderWidth: "1px",
  borderColor: cssVar("color-line"),
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
};
