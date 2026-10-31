// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";
import type { TextVariant } from "./types.js";

const baseTextStyle: CSSProperties = {
  margin: 0,
  fontFamily: cssVar("font-family-base"),
  color: cssVar("color-fg"),
};

export const textVariantStyles: Record<TextVariant, CSSProperties> = {
  brand: {
    ...baseTextStyle,
    fontSize: cssVar("font-size-lg"),
    fontWeight: cssVar("font-weight-semibold"),
  },
  heading: {
    ...baseTextStyle,
    fontSize: cssVar("font-size-lg"),
    fontWeight: cssVar("font-weight-semibold"),
  },
  subheading: {
    ...baseTextStyle,
    fontSize: cssVar("font-size-md"),
    fontWeight: cssVar("font-weight-semibold"),
  },
  body: { ...baseTextStyle, fontSize: cssVar("font-size-md") },
  label: {
    ...baseTextStyle,
    fontSize: cssVar("font-size-md"),
    fontWeight: cssVar("font-weight-semibold"),
  },
  action: {
    ...baseTextStyle,
    fontSize: cssVar("font-size-md"),
    fontWeight: cssVar("font-weight-semibold"),
  },
  status: { ...baseTextStyle, fontSize: cssVar("font-size-sm") },
  error: { ...baseTextStyle, fontSize: cssVar("font-size-sm"), color: cssVar("color-danger") },
};
