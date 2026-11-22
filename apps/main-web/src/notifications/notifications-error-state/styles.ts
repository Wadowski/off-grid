// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import type { NotificationsStateLayout } from "../types.js";

const notificationsErrorStatePageStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: tokens.space[3],
  padding: tokens.space[6],
  textAlign: "center",
};

const notificationsErrorStateSheetStyle: CSSProperties = {
  display: "grid",
  justifyItems: "start",
  gap: tokens.space[2],
  padding: tokens.space[4],
  textAlign: "start",
};

export const notificationsErrorStateStyles: Readonly<
  Record<NotificationsStateLayout, CSSProperties>
> = {
  page: notificationsErrorStatePageStyle,
  sheet: notificationsErrorStateSheetStyle,
};
