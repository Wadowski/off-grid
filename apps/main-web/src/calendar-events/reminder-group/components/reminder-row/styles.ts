// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const reminderRowStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
};

export const reminderRowControlsStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: tokens.space[2],
};

export const reminderAmountCellStyle: CSSProperties = {
  flex: "0 0 6rem",
  minWidth: 0,
};

const centeredCellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  minHeight: "3rem",
};

export const reminderUnitCellStyle: CSSProperties = {
  ...centeredCellStyle,
  flex: "1 1 0",
  minWidth: 0,
};

export const reminderRemoveCellStyle: CSSProperties = {
  ...centeredCellStyle,
  flex: "0 0 auto",
};

export const reminderZeroHelperStyle: CSSProperties = {
  color: cssVar("color-muted"),
};
