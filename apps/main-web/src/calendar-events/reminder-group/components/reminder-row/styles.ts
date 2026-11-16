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

// The amount TextField keeps a visually hidden label row, and the field frame's
// column gap still applies above the input. Pull the cell up by that gap so the
// number box lines up with the unit dropdown.
export const reminderAmountCellStyle: CSSProperties = {
  flex: "0 0 6rem",
  minWidth: 0,
  marginTop: `calc(-1 * ${cssVar("space-1")})`,
};

const DESKTOP_FIELD_HEIGHT = "2.25rem";
const PHONE_FIELD_HEIGHT = "3rem";

const centeredCellStyle = (narrow: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  minHeight: narrow ? PHONE_FIELD_HEIGHT : DESKTOP_FIELD_HEIGHT,
});

export const reminderUnitCellStyle: CSSProperties = {
  flex: "1 1 0",
  minWidth: 0,
};

export const reminderSuffixCellStyle = (narrow: boolean): CSSProperties => ({
  ...centeredCellStyle(narrow),
  flex: "0 0 auto",
  color: cssVar("color-muted"),
  whiteSpace: "nowrap",
});

export const reminderRemoveCellStyle = (narrow: boolean): CSSProperties => ({
  ...centeredCellStyle(narrow),
  flex: "0 0 auto",
});

export const reminderZeroHelperStyle: CSSProperties = {
  color: cssVar("color-muted"),
};
