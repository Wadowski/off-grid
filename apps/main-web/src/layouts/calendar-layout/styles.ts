// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarLayoutStyle = (narrow: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: narrow ? "minmax(0, 1fr)" : "14rem minmax(0, 1fr)",
  alignItems: "start",
  gap: tokens.space[6],
});

export const calendarLayoutContentStyle: CSSProperties = {
  minWidth: 0,
};
