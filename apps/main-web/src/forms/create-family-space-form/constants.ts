// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const ACCENT_IDS = ["blue", "sage", "terracotta", "lilac"] as const;

export type AccentId = (typeof ACCENT_IDS)[number];

export const SPACE_PURPOSE_IDS = ["household", "getaway", "extended"] as const;

export type SpacePurposeId = (typeof SPACE_PURPOSE_IDS)[number];

export const SPACE_PURPOSE_OPTIONS = [
  {
    id: "household",
    iconName: "home",
    nameTextId: "families.purposeHousehold",
    descriptionTextId: "families.purposeHouseholdDescription",
  },
  {
    id: "getaway",
    iconName: "deck",
    nameTextId: "families.purposeGetaway",
    descriptionTextId: "families.purposeGetawayDescription",
  },
  {
    id: "extended",
    iconName: "hub",
    nameTextId: "families.purposeExtended",
    descriptionTextId: "families.purposeExtendedDescription",
  },
] as const;
