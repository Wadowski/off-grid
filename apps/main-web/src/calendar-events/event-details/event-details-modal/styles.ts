// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const detailsHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  padding: `${tokens.space[3]} ${tokens.space[4]}`,
};

export const detailsActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};

export const detailsCalendarChipStyle = (accent: string | undefined): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[2],
  padding: `${tokens.space[1]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.full,
  background: cssVar("color-surface-high"),
  color: accent ?? cssVar("color-fg"),
});

export const detailsDotStyle = (accent: string | undefined): CSSProperties => ({
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  background: accent ?? cssVar("color-primary"),
});
