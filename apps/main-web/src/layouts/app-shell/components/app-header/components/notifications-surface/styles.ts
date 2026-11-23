// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const notificationsSurfaceTitleRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  width: "100%",
  minWidth: 0,
};

export const notificationsSurfaceListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: tokens.space[4],
};

export const notificationsSurfaceCardRowStyle: CSSProperties = {
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface-low"),
  boxShadow: cssVar("elevation-1"),
};

export const notificationsSurfaceStateStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: tokens.space[2],
  padding: tokens.space[4],
};

export const notificationsSurfaceFooterStyle: CSSProperties = {
  padding: tokens.space[4],
  borderTop: `1px solid ${cssVar("color-surface-high")}`,
};
