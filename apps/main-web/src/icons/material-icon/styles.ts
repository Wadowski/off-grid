// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";

export const materialIconStyle = (size: string, color: string, filled: boolean): CSSProperties => ({
  fontSize: size,
  color,
  lineHeight: 1,
  flexShrink: 0,
  userSelect: "none",
  fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
});

export const materialIconCss = `
.og-material-icon::before {
  content: attr(data-icon);
}
`;
