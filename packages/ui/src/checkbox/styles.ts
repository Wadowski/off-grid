// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: cssVar("space-2"),
  padding: cssVar("space-2"),
  borderRadius: cssVar("radius-md"),
  background: cssVar("color-surface-low"),
  cursor: "pointer",
};

export const checkboxInputStyle: CSSProperties = {
  flexShrink: 0,
  margin: 0,
  accentColor: cssVar("color-accent"),
};
