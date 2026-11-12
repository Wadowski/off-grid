// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const segmentedControlStyle: CSSProperties = {
  display: "flex",
  padding: cssVar("space-1"),
  gap: cssVar("space-1"),
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-surface-high"),
};

export const segmentedOptionBaseStyle: CSSProperties = {
  flex: "1 1 0",
  minWidth: 0,
  padding: `${cssVar("space-2")} ${cssVar("space-3")}`,
  borderWidth: 0,
  borderRadius: cssVar("radius-full"),
  background: "transparent",
  color: cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-body-md"),
  lineHeight: cssVar("line-height-body-md"),
  letterSpacing: cssVar("letter-spacing-body-md"),
  fontWeight: cssVar("font-weight-medium"),
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export const segmentedOptionSelectedStyle: CSSProperties = {
  background: cssVar("color-accent"),
  color: cssVar("color-accent-fg"),
};
