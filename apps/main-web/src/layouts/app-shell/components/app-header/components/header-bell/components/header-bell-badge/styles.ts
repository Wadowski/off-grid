// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const headerBellBadgeStyle: CSSProperties = {
  position: "absolute",
  top: `-${tokens.space[3]}`,
  right: `-${tokens.space[2]}`,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: tokens.space[5],
  height: tokens.space[5],
  padding: `0 ${tokens.space[1]}`,
  boxSizing: "border-box",
  borderRadius: tokens.radius.full,
  background: cssVar("color-primary"),
  color: cssVar("color-accent-fg"),
  pointerEvents: "none",
};
