// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const cssColor = (name: string): string => `var(--og-color-${name})`;

export const strengthBarsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  paddingTop: tokens.space[1],
};

export const barsStyle = (segments: number): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))`,
  gap: "0.375rem",
});

export const barStyle = (filled: boolean, strong: boolean): CSSProperties => ({
  height: "0.25rem",
  borderRadius: tokens.radius.full,
  background: filled ? cssColor(strong ? "good" : "warn") : cssColor("surface-high"),
});

export const hintStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.375rem",
  paddingInline: "0.125rem",
  color: cssColor("muted"),
};
