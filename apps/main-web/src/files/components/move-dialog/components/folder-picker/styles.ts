// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const folderPickerStyle: CSSProperties = {
  maxHeight: "min(50vh, 24rem)",
  overflowY: "auto",
  border: `1px solid ${cssVar("color-line")}`,
  borderRadius: tokens.radius.md,
  padding: tokens.space[1],
  background: cssVar("color-surface"),
};

export const folderPickerFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: tokens.space[2],
  padding: `${tokens.space[1]} ${tokens.space[3]} ${tokens.space[1]} ${tokens.space[9]}`,
};
