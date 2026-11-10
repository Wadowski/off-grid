// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import type { AccentId } from "../../constants.js";

export const accentPickerStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
};

export const accentRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-bg"),
};

export const accentPreviewStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
};

export const accentSwatchesStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};

const accentIconTileStyle: CSSProperties = {
  width: "2.5rem",
  height: "2.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: tokens.radius.lg,
};

const accentColors: Record<AccentId, { background: string; foreground: string }> = {
  blue: { background: cssVar("color-accent"), foreground: cssVar("color-accent-fg") },
  sage: { background: cssVar("color-good"), foreground: cssVar("color-surface") },
  terracotta: { background: cssVar("color-warn"), foreground: cssVar("color-surface") },
  lilac: { background: cssVar("color-primary"), foreground: cssVar("color-surface") },
};

const accentSwatchBaseStyle: CSSProperties = {
  width: "1.5rem",
  height: "1.5rem",
  borderRadius: tokens.radius.full,
  borderStyle: "solid",
  borderWidth: "2px",
  borderColor: "transparent",
};

export const accentIconTile = (accent: AccentId): CSSProperties => ({
  ...accentIconTileStyle,
  background: accentColors[accent].background,
  color: accentColors[accent].foreground,
});

export const accentSwatch = (accent: AccentId, selected: boolean): CSSProperties => ({
  ...accentSwatchBaseStyle,
  background: accentColors[accent].background,
  borderColor: selected ? cssVar("color-fg") : "transparent",
});
