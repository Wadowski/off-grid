// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "../css-var.js";
import { FILE_TABLE_ACTIONS_WIDTH_BY_VARIANT } from "../constants.js";
import type { FileTableColumn, FileTableVariant } from "./types.js";

export const fileTableStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  borderCollapse: "collapse",
  tableLayout: "fixed",
  color: cssVar("color-fg"),
};

export const fileTableHeaderCellStyle = (column: FileTableColumn): CSSProperties => ({
  width: column.width,
  padding: `${cssVar("space-2")} ${cssVar("space-3")}`,
  textAlign: column.align,
  whiteSpace: "nowrap",
  verticalAlign: "bottom",
  color: cssVar("color-muted"),
  borderBottom: `1px solid ${cssVar("color-line")}`,
});

export const fileTableActionsHeaderStyle = (variant: FileTableVariant): CSSProperties => ({
  width: FILE_TABLE_ACTIONS_WIDTH_BY_VARIANT[variant],
  padding: 0,
  borderBottom: `1px solid ${cssVar("color-line")}`,
});
