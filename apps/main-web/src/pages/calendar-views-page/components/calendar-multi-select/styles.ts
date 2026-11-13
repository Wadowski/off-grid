// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarMultiSelectDotStyle = (background: string): CSSProperties => ({
  display: "inline-block",
  width: "8px",
  height: "8px",
  flexShrink: 0,
  borderRadius: cssVar("radius-full"),
  background,
});
