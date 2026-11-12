// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarViewsPageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  minWidth: 0,
};

export const calendarViewsHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  minWidth: 0,
};

export const calendarViewsTitleStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: tokens.space[1],
  minWidth: 0,
};

export const calendarViewsActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[1],
  flexShrink: 0,
};

export const familyPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[1],
  maxWidth: "100%",
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-surface-high"),
};

export const familyDotStyle = (background: string): CSSProperties => ({
  width: "8px",
  height: "8px",
  flexShrink: 0,
  borderRadius: cssVar("radius-full"),
  background,
});

export const calendarViewsStatusStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: tokens.space[2],
};
