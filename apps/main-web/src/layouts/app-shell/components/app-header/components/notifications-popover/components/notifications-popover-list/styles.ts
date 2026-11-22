// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const notificationsPopoverListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: tokens.space[4],
};

export const notificationsPopoverCardRowStyle: CSSProperties = {
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface-low"),
  boxShadow: cssVar("elevation-1"),
};

export const notificationsPopoverStateStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: tokens.space[2],
  padding: tokens.space[4],
};
