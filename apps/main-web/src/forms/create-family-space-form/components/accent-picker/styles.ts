// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import type { FamilyAccent } from "@offgrid/contracts";
import { FAMILY_ACCENT_COLORS } from "../../../../families/family-appearance.js";

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

export const accentPreviewTextStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
};

export const accentSwatchesStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};

const accentSwatchBaseStyle: CSSProperties = {
  width: "1.5rem",
  height: "1.5rem",
  borderRadius: tokens.radius.full,
  borderStyle: "solid",
  borderWidth: "2px",
  borderColor: "transparent",
};

export const accentSwatch = (accent: FamilyAccent, selected: boolean): CSSProperties => ({
  ...accentSwatchBaseStyle,
  background: FAMILY_ACCENT_COLORS[accent].background,
  borderColor: selected ? cssVar("color-fg") : "transparent",
});
