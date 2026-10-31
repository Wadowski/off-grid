// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const textFieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-1"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-md"),
  color: cssVar("color-fg"),
};

export const textFieldInputStyle: CSSProperties = {
  padding: cssVar("space-2"),
  borderRadius: cssVar("radius-sm"),
  borderStyle: "solid",
  borderWidth: "1px",
  background: cssVar("color-bg"),
  color: cssVar("color-fg"),
  font: "inherit",
};

export const textFieldValidBorderStyle: CSSProperties = {
  borderColor: cssVar("color-muted"),
};

export const textFieldInvalidBorderStyle: CSSProperties = {
  borderColor: cssVar("color-danger"),
};

export const textFieldErrorStyle: CSSProperties = {
  margin: 0,
  fontSize: cssVar("font-size-sm"),
  color: cssVar("color-danger"),
};
