// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const notificationsListFooterStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  minWidth: 0,
};

export const notificationsListFooterRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
};

export const notificationsCaughtUpStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.space[1],
  padding: tokens.space[4],
  minWidth: 0,
};
