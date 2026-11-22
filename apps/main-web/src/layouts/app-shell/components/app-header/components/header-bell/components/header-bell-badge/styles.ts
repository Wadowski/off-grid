// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const headerBellBadgeStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: tokens.space[5],
  height: tokens.space[5],
  padding: `0 ${tokens.space[1]}`,
  boxSizing: "border-box",
  borderRadius: tokens.radius.full,
  background: "var(--og-color-primary)",
  color: "var(--og-color-accent-fg)",
  pointerEvents: "none",
};
