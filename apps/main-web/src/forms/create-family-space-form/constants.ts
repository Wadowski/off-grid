// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FAMILY_PURPOSE_ICON_NAMES } from "../../families/family-appearance.js";

export const SPACE_PURPOSE_OPTIONS = [
  {
    id: "household",
    iconName: FAMILY_PURPOSE_ICON_NAMES.household,
    nameTextId: "families.purposeHousehold",
    descriptionTextId: "families.purposeHouseholdDescription",
  },
  {
    id: "getaway",
    iconName: FAMILY_PURPOSE_ICON_NAMES.getaway,
    nameTextId: "families.purposeGetaway",
    descriptionTextId: "families.purposeGetawayDescription",
  },
  {
    id: "extended",
    iconName: FAMILY_PURPOSE_ICON_NAMES.extended,
    nameTextId: "families.purposeExtended",
    descriptionTextId: "families.purposeExtendedDescription",
  },
] as const;
