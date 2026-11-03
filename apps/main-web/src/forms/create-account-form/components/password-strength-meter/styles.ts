// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const meterStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  width: "100%",
};

export const meterTrackStyle: CSSProperties = {
  height: "0.375rem",
  borderRadius: tokens.radius.sm,
  background: "var(--og-color-line)",
  overflow: "hidden",
};

export const meterFillStyle = (fraction: number): CSSProperties => ({
  height: "100%",
  width: `${fraction * 100}%`,
  background: "var(--og-color-accent)",
});
