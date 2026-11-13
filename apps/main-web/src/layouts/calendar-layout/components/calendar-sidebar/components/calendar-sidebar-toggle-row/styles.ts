// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const toggleRowNameStyle: CSSProperties = {
  flex: "1 1 auto",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const toggleRowDotStyle = (background: string): CSSProperties => ({
  flexShrink: 0,
  width: "10px",
  height: "10px",
  borderRadius: tokens.radius.full,
  background,
});
