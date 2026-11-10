// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";
import type { IconTileShape } from "./types.js";

export const iconTileStyle = (
  size: string,
  shape: IconTileShape,
  background: string,
  color: string,
): CSSProperties => ({
  display: "grid",
  placeItems: "center",
  width: size,
  height: size,
  borderRadius: shape === "circle" ? "9999px" : cssVar("radius-md"),
  background,
  color,
  fontWeight: 600,
  flexShrink: 0,
});
