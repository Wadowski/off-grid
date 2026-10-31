// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";
import type { ButtonVariant } from "./types.js";

export const buttonBaseStyle: CSSProperties = {
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-md"),
  fontWeight: cssVar("font-weight-semibold"),
  lineHeight: 1.5,
  padding: `${cssVar("space-2")} ${cssVar("space-4")}`,
  borderRadius: cssVar("radius-md"),
  borderStyle: "solid",
  borderWidth: "1px",
  cursor: "pointer",
};

export const buttonVariantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: cssVar("color-accent"),
    borderColor: cssVar("color-accent"),
    color: cssVar("color-accent-fg"),
  },
  secondary: {
    background: cssVar("color-surface"),
    borderColor: cssVar("color-muted"),
    color: cssVar("color-fg"),
  },
};
