// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const sectionStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  minWidth: 0,
};

export const sectionHeaderStyle: CSSProperties = {
  padding: "0 0.5rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: cssVar("color-outline"),
};

export const sectionCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-1"),
  overflow: "hidden",
};
