// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const cardStyle: CSSProperties = {
  padding: cssVar("space-4"),
  borderRadius: cssVar("radius-md"),
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  boxShadow: cssVar("elevation-1"),
};
