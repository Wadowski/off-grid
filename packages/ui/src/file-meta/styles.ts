// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const fileMetaStyle = (spread: boolean): CSSProperties => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  justifyContent: spread ? "space-between" : "flex-start",
  columnGap: cssVar("space-2"),
  color: cssVar("color-muted"),
  fontVariantNumeric: "tabular-nums",
});
