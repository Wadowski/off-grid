// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const dateTimeBlockCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  padding: tokens.space[3],
  borderRadius: tokens.radius.md,
  background: cssVar("color-surface"),
  boxShadow: tokens.elevation[1],
};

export const dateTimeBlockRowStyle = (showTime: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: showTime ? "minmax(0, 1fr) 6rem" : "minmax(0, 1fr)",
  gap: tokens.space[2],
});
