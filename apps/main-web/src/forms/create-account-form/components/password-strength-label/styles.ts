// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const strengthLabelStyle = (strong: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.space[1],
  color: `var(--og-color-${strong ? "good" : "warn"})`,
  fontFamily: tokens.font.family.mono,
});
