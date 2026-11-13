// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";
import type { ButtonAlign, ButtonSize, ButtonVariant } from "./types.js";

export const buttonBaseStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: cssVar("space-1"),
  fontFamily: cssVar("font-family-heading"),
  fontSize: cssVar("font-size-headline-sm"),
  lineHeight: cssVar("line-height-headline-sm"),
  letterSpacing: cssVar("letter-spacing-headline-sm"),
  fontWeight: cssVar("font-weight-semibold"),
  padding: `${cssVar("space-7")} ${cssVar("space-3")}`,
  borderRadius: cssVar("radius-md"),
  borderStyle: "solid",
  borderWidth: "1px",
  cursor: "pointer",
};

export const buttonDisabledStyle: CSSProperties = {
  cursor: "not-allowed",
  opacity: 0.45,
  boxShadow: "none",
};

export const buttonFullWidthStyle: CSSProperties = {
  width: "100%",
};

export const buttonSizeStyles: Record<ButtonSize, CSSProperties> = {
  medium: {},
  small: {
    padding: `${cssVar("space-1")} ${cssVar("space-2")}`,
    fontSize: cssVar("font-size-label-md"),
  },
};

export const buttonAlignStyles: Record<ButtonAlign, CSSProperties> = {
  center: {},
  start: {
    justifyContent: "flex-start",
    textAlign: "start",
  },
};

export const buttonVariantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: cssVar("color-accent"),
    borderWidth: "0",
    borderColor: cssVar("color-accent"),
    color: cssVar("color-accent-fg"),
    boxShadow: cssVar("elevation-3"),
  },
  secondary: {
    background: cssVar("color-surface"),
    borderColor: cssVar("color-line"),
    color: cssVar("color-fg"),
  },
  ghost: {
    background: "transparent",
    borderWidth: "0",
    borderColor: "transparent",
    color: cssVar("color-muted"),
    padding: cssVar("space-1"),
  },
};
