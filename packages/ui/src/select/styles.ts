// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const selectStyle: CSSProperties = {
  padding: `${cssVar("space-1")} ${cssVar("space-2")}`,
  borderRadius: cssVar("radius-md"),
  border: `1px solid ${cssVar("color-line")}`,
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
};
