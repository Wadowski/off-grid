// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const notificationsBodyStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[5],
  minWidth: 0,
};

export const notificationsLoadingStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  padding: tokens.space[6],
};
