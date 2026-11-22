// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const TAB_BAR_CLEARANCE = `calc(${tokens.space[10]} * 2 + env(safe-area-inset-bottom, 0px))`;

export const notificationsModalDialogStyle: CSSProperties = {
  position: "fixed",
  top: "auto",
  right: tokens.space[8],
  bottom: TAB_BAR_CLEARANCE,
  left: tokens.space[8],
  width: "auto",
  maxWidth: "none",
  maxHeight: "82dvh",
  margin: 0,
  padding: 0,
  border: "none",
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-2"),
  overflow: "hidden",
};

export const notificationsModalSheetStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  maxHeight: "82dvh",
  minHeight: 0,
};

export const notificationsModalChipsStyle: CSSProperties = {
  padding: `${tokens.space[1]} ${tokens.space[4]} ${tokens.space[3]}`,
  minWidth: 0,
};
