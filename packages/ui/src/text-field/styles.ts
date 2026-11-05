// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";

export const textFieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-1"),
  minWidth: 0,
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-label-md"),
  color: cssVar("color-fg"),
};

export const textFieldLabelRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: cssVar("space-2"),
};

export const textFieldErrorStyle: CSSProperties = {
  margin: 0,
  fontSize: cssVar("font-size-body-sm"),
  lineHeight: cssVar("line-height-body-sm"),
  color: cssVar("color-danger"),
};
