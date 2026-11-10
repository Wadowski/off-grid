// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";
import type { TextVariant } from "./types.js";

const baseTextStyle: CSSProperties = {
  margin: 0,
  fontFamily: cssVar("font-family-base"),
  color: "inherit",
};

const typeStyle = (
  size: string,
  weight: string,
  family: string = cssVar("font-family-base"),
): CSSProperties => ({
  ...baseTextStyle,
  fontFamily: family,
  fontSize: cssVar(`font-size-${size}`),
  lineHeight: cssVar(`line-height-${size}`),
  letterSpacing: cssVar(`letter-spacing-${size}`),
  fontWeight: cssVar(`font-weight-${weight}`),
});

export const textVariantStyles: Record<TextVariant, CSSProperties> = {
  brand: typeStyle("headline-sm", "semibold", cssVar("font-family-heading")),
  heading: typeStyle("headline-lg", "semibold", cssVar("font-family-heading")),
  subheading: typeStyle("headline-md", "semibold", cssVar("font-family-heading")),
  body: typeStyle("body-md", "regular"),
  label: typeStyle("label-md", "medium"),
  caption: typeStyle("label-sm", "medium"),
  action: { ...typeStyle("headline-sm", "semibold"), color: "inherit" },
  status: typeStyle("body-sm", "regular"),
  link: { ...typeStyle("body-sm", "medium"), color: cssVar("color-accent") },
  error: { ...typeStyle("body-sm", "regular"), color: cssVar("color-danger") },
};
