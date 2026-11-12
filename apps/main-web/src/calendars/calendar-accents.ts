// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { CALENDAR_COLORS, type FamilyAccent } from "@offgrid/contracts";
import { FAMILY_ACCENT_COLORS } from "../families/family-appearance.js";

export type CalendarColor = (typeof CALENDAR_COLORS)[number];

// The API accepts six calendar colors. Rose and violet have no exact family accent, so they reuse the nearest one.
export const CALENDAR_COLOR_ACCENT: Record<CalendarColor, FamilyAccent> = {
  blue: "blue",
  teal: "teal",
  green: "green",
  amber: "amber",
  rose: "pink",
  violet: "purple",
};

export const calendarAccentColor = (
  color: CalendarColor,
): (typeof FAMILY_ACCENT_COLORS)[FamilyAccent] =>
  FAMILY_ACCENT_COLORS[CALENDAR_COLOR_ACCENT[color]];
