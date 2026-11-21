// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const notificationsDayGroupStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  minWidth: 0,
};

export const notificationsDayGroupHeadingStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: tokens.space[2],
};

export const notificationsDayGroupCardsStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  minWidth: 0,
};
