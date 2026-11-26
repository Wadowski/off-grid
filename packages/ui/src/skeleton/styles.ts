// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";
import type { SkeletonShape } from "./types.js";

export const skeletonStyle = (
  width: string,
  height: string,
  shape: SkeletonShape,
): CSSProperties => ({
  display: "block",
  width,
  height,
  flexShrink: 0,
  borderRadius: shape === "circle" ? cssVar("radius-full") : cssVar("radius-sm"),
  background: cssVar("color-surface-high"),
});
