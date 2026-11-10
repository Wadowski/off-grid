// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familySpacesHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
};

export const familySpaceGroupStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  overflow: "hidden",
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
};

export const familySpaceErrorStyle: CSSProperties = {
  color: cssVar("color-danger"),
};
