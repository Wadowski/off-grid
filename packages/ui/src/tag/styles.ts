// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";
import type { TagTone } from "./types.js";

export const tagBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: `${cssVar("space-1")} ${cssVar("space-2")}`,
  borderRadius: cssVar("radius-full"),
  borderStyle: "solid",
  borderWidth: "1px",
  whiteSpace: "nowrap",
};

export const tagToneStyles: Record<TagTone, CSSProperties> = {
  neutral: {
    background: cssVar("color-surface-high"),
    borderColor: cssVar("color-line"),
    color: cssVar("color-fg"),
  },
  accent: {
    background: cssVar("color-accent-soft"),
    borderColor: "transparent",
    color: cssVar("color-primary"),
  },
};
