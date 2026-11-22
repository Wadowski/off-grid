// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const notificationsModalHeaderStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: tokens.space[3],
  padding: `${tokens.space[2]} ${tokens.space[4]} 0`,
};

export const notificationsModalHandleStyle: CSSProperties = {
  width: tokens.space[10],
  height: tokens.space[1],
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-line"),
};

export const notificationsModalTitleRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  width: "100%",
  minWidth: 0,
};

export const notificationsModalActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[1],
  flexShrink: 0,
};
