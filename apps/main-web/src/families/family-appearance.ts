// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyAccent, FamilyPurpose } from "@offgrid/contracts";
import { cssVar } from "@offgrid/ui";

export const FAMILY_ACCENTS: readonly FamilyAccent[] = ["blue", "sage", "terracotta", "lilac"];

export const FAMILY_ACCENT_LABEL_TEXT_IDS = {
  blue: "families.accentBlue",
  sage: "families.accentSage",
  terracotta: "families.accentTerracotta",
  lilac: "families.accentLilac",
} as const satisfies Record<FamilyAccent, string>;

export const FAMILY_ACCENT_COLORS: Record<
  FamilyAccent,
  { readonly background: string; readonly color: string }
> = {
  blue: { background: cssVar("color-accent"), color: cssVar("color-accent-fg") },
  sage: { background: cssVar("color-good"), color: cssVar("color-surface") },
  terracotta: { background: cssVar("color-warn"), color: cssVar("color-surface") },
  lilac: { background: cssVar("color-primary"), color: cssVar("color-surface") },
};

export const FAMILY_PURPOSE_ICON_NAMES: Record<FamilyPurpose, string> = {
  household: "home",
  getaway: "deck",
  extended: "hub",
};
