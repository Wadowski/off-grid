// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const notificationsErrorStateStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: tokens.space[3],
  padding: tokens.space[6],
  textAlign: "center",
};
