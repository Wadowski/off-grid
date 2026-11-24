// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const filePreviewHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  padding: tokens.space[3],
  borderBottom: `1px solid ${cssVar("color-surface-high")}`,
};

export const filePreviewTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const filePreviewNameStyle: CSSProperties = {
  margin: 0,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const filePreviewControlsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[1],
};
