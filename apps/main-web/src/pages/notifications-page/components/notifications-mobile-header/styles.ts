// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const notificationsMobileHeaderStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  minWidth: 0,
};

export const notificationsMobileBackStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  minWidth: 0,
};

export const notificationsMobileHeadingRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  minWidth: 0,
};
