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
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: tokens.space[2],
};

export const reminderAmountCellStyle: CSSProperties = {
  flex: "1 1 5rem",
  maxWidth: "8rem",
  minWidth: "4.5rem",
};

export const reminderUnitCellStyle: CSSProperties = {
  flex: "1 1 7rem",
  minWidth: "6rem",
  paddingTop: tokens.space[5],
};

export const reminderSuffixStyle: CSSProperties = {
  paddingTop: tokens.space[5],
  color: cssVar("color-muted"),
};

export const reminderRemoveCellStyle: CSSProperties = {
  paddingTop: tokens.space[4],
};

export const reminderZeroHelperStyle: CSSProperties = {
  color: cssVar("color-muted"),
};
