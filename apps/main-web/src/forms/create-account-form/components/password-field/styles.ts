// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const visibilityToggleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: tokens.space[1],
  border: "none",
  background: "transparent",
  borderRadius: tokens.radius.sm,
  cursor: "pointer",
};
