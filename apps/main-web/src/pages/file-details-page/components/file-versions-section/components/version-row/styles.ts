// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const versionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  padding: tokens.space[2],
  borderRadius: cssVar("radius-md"),
  background: cssVar("color-surface"),
  minWidth: 0,
};

export const versionRowInfoStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  minWidth: 0,
  flex: "1 1 180px",
};

export const versionRowTitleStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const versionRowMetaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: tokens.space[2],
  color: cssVar("color-muted"),
  minWidth: 0,
  overflowWrap: "anywhere",
};
