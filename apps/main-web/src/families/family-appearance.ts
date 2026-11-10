// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyAccent, FamilyPurpose } from "@offgrid/contracts";

export const FAMILY_ACCENTS: readonly FamilyAccent[] = [
  "blue",
  "sky",
  "teal",
  "green",
  "lime",
  "amber",
  "orange",
  "red",
  "pink",
  "purple",
  "indigo",
  "slate",
];

export const FAMILY_ACCENT_LABEL_TEXT_IDS = {
  blue: "families.accentBlue",
  sky: "families.accentSky",
  teal: "families.accentTeal",
  green: "families.accentGreen",
  lime: "families.accentLime",
  amber: "families.accentAmber",
  orange: "families.accentOrange",
  red: "families.accentRed",
  pink: "families.accentPink",
  purple: "families.accentPurple",
  indigo: "families.accentIndigo",
  slate: "families.accentSlate",
} as const satisfies Record<FamilyAccent, string>;

// Mid-tone colours sit between the light and dark surfaces, so each reads on both themes.
export const FAMILY_ACCENT_COLORS: Record<
  FamilyAccent,
  { readonly background: string; readonly color: string }
> = {
  blue: { background: "#3b6fd4", color: "#ffffff" },
  sky: { background: "#0b8fc2", color: "#ffffff" },
  teal: { background: "#0f9488", color: "#ffffff" },
  green: { background: "#3f9142", color: "#ffffff" },
  lime: { background: "#7a9a1e", color: "#ffffff" },
  amber: { background: "#d38a0e", color: "#1b1b1e" },
  orange: { background: "#e0622b", color: "#ffffff" },
  red: { background: "#d1434b", color: "#ffffff" },
  pink: { background: "#c9488a", color: "#ffffff" },
  purple: { background: "#8e4dc4", color: "#ffffff" },
  indigo: { background: "#5a5fd0", color: "#ffffff" },
  slate: { background: "#5f6b7d", color: "#ffffff" },
};

export const FAMILY_PURPOSE_ICON_NAMES: Record<FamilyPurpose, string> = {
  household: "home",
  getaway: "deck",
  extended: "hub",
};
