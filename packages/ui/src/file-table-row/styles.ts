// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";
import { fileNameStyle } from "../files/styles.js";

export const fileTableRowStyle = (selected: boolean): CSSProperties => ({
  height: "3.5rem",
  background: selected ? cssVar("color-accent-soft") : "transparent",
  color: cssVar("color-fg"),
});

export const fileTableCellStyle: CSSProperties = {
  padding: `${cssVar("space-2")} ${cssVar("space-3")}`,
  borderBottom: `1px solid ${cssVar("color-line")}`,
  verticalAlign: "middle",
  minWidth: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
};

export const fileTableSizeCellStyle: CSSProperties = {
  ...fileTableCellStyle,
  textAlign: "end",
};

export const fileTableActivatorStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: cssVar("space-3"),
  minWidth: 0,
  borderRadius: cssVar("radius-md"),
};

export const fileTableNameStyle: CSSProperties = {
  ...fileNameStyle,
  minWidth: 0,
};
