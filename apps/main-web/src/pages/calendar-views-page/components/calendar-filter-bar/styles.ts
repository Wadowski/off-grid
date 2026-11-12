// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarFilterBarStyle: CSSProperties = {
  display: "flex",
  gap: tokens.space[1],
  overflowX: "auto",
  paddingBottom: tokens.space[1],
};
