// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const appHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[4],
  padding: tokens.space[4],
  background: "var(--og-color-surface)",
};
