// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const driveControlStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flex: "1 1 auto",
  gap: tokens.space[2],
  minHeight: "2.75rem",
  minWidth: 0,
  borderRadius: cssVar("radius-md"),
  color: cssVar("color-fg"),
  textDecoration: "none",
};

export const driveControlTextStyle: CSSProperties = {
  display: "grid",
  flex: "1 1 auto",
  minWidth: 0,
};

export const driveControlNameStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
};
