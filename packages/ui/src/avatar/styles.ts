// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const avatarStyle = (size: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: size,
  height: size,
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-accent-soft"),
  color: cssVar("color-primary"),
  fontFamily: cssVar("font-family-heading"),
  fontSize: cssVar("font-size-label-md"),
  fontWeight: cssVar("font-weight-semibold"),
});
