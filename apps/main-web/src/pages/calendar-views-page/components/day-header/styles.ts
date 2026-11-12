// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const dayHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  minWidth: 0,
};

export const dayHeaderTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const dayHeaderCountStyle: CSSProperties = {
  flexShrink: 0,
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: cssVar("radius-sm"),
  background: cssVar("color-good"),
  color: cssVar("color-accent-fg"),
  fontFamily: cssVar("font-family-mono"),
  fontSize: cssVar("font-size-mono-code"),
  lineHeight: cssVar("line-height-mono-code"),
  fontWeight: cssVar("font-weight-medium"),
};
