// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const calendarListStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const colorDotStyle = (background: string): CSSProperties => ({
  flexShrink: 0,
  width: "10px",
  height: "10px",
  borderRadius: tokens.radius.full,
  background,
});
