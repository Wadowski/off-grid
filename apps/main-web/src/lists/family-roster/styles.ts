// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const rosterSectionStyle: CSSProperties = {
  display: "grid",
  overflow: "hidden",
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
};

export const rosterHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  padding: tokens.space[4],
  borderBottomStyle: "solid",
  borderBottomWidth: "1px",
  borderBottomColor: cssVar("color-surface-high"),
};

export const rosterGroupStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
};
