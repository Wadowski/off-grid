// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const radioLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: cssVar("space-2"),
  cursor: "pointer",
};

export const radioCenteredLabelStyle: CSSProperties = {
  ...radioLabelStyle,
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

export const radioInputStyle: CSSProperties = {
  flexShrink: 0,
  margin: 0,
  marginTop: "2px",
  accentColor: cssVar("color-accent"),
};
