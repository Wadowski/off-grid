// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import {
  NOTIFICATIONS_POPOVER_GUTTER,
  NOTIFICATIONS_POPOVER_MAX_LIST_HEIGHT,
  NOTIFICATIONS_POPOVER_TOP,
  NOTIFICATIONS_POPOVER_WIDTH,
} from "./constants.js";

export const notificationsPopoverDialogStyle: CSSProperties = {
  position: "fixed",
  top: NOTIFICATIONS_POPOVER_TOP,
  right: NOTIFICATIONS_POPOVER_GUTTER,
  bottom: "auto",
  left: "auto",
  width: NOTIFICATIONS_POPOVER_WIDTH,
  maxWidth: `calc(100vw - 2 * ${NOTIFICATIONS_POPOVER_GUTTER})`,
  margin: 0,
  padding: 0,
  border: "none",
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-surface"),
  boxShadow: cssVar("elevation-2"),
  overflow: "hidden",
};

export const notificationsPopoverSheetStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  maxHeight: NOTIFICATIONS_POPOVER_MAX_LIST_HEIGHT,
  minHeight: 0,
};

export const notificationsPopoverChipsStyle: CSSProperties = {
  padding: `${tokens.space[1]} ${tokens.space[4]} ${tokens.space[3]}`,
  minWidth: 0,
};
