// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import type { SettingsIconTone } from "../../types.js";

export const linkRowStyle = (isFirst: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  minHeight: "44px",
  padding: tokens.space[3],
  borderTop: isFirst ? "none" : `1px solid ${cssVar("color-surface-high")}`,
  color: "inherit",
  textDecoration: "none",
  minWidth: 0,
});

export const linkTextStyle: CSSProperties = {
  display: "grid",
  gap: "0.125rem",
  minWidth: 0,
};

const TONE_COLORS: Record<
  SettingsIconTone,
  { readonly background: string; readonly color: string }
> = {
  accent: { background: cssVar("color-accent"), color: cssVar("color-accent-fg") },
  soft: { background: cssVar("color-accent-soft"), color: cssVar("color-accent") },
  good: { background: cssVar("color-secondary-fixed"), color: cssVar("color-good") },
};

export const settingsIconColors = (tone: SettingsIconTone) => TONE_COLORS[tone];

export const linkRowIcon = {
  chevron: cssVar("color-outline"),
} as const;
