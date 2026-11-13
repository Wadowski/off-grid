// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const filterChipBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  gap: cssVar("space-2"),
  padding: `${cssVar("space-1")} ${cssVar("space-3")}`,
  borderRadius: cssVar("radius-full"),
  borderStyle: "solid",
  borderWidth: "1px",
  borderColor: cssVar("color-line"),
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
  lineHeight: cssVar("line-height-label-md"),
  letterSpacing: cssVar("letter-spacing-label-md"),
  fontWeight: cssVar("font-weight-medium"),
  whiteSpace: "nowrap",
  cursor: "pointer",
};

export const filterChipSelectedStyle: CSSProperties = {
  background: cssVar("color-accent-soft"),
  borderColor: "transparent",
  color: cssVar("color-primary"),
};

export const filterChipDotStyle: CSSProperties = {
  width: "8px",
  height: "8px",
  flexShrink: 0,
  borderRadius: cssVar("radius-full"),
};
