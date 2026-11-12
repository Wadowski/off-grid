// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { CALENDAR_COLORS } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { FAMILY_ACCENT_COLORS, FAMILY_ACCENTS } from "../families/family-appearance.js";
import { CALENDAR_COLOR_ACCENT, calendarAccentColor } from "./calendar-accents.js";

describe("calendar accent colors", () => {
  it.each(CALENDAR_COLORS)("maps %s to a family accent", (color) => {
    expect(FAMILY_ACCENTS).toContain(CALENDAR_COLOR_ACCENT[color]);
  });

  it.each(CALENDAR_COLORS)("returns the family accent colors for %s", (color) => {
    expect(calendarAccentColor(color)).toBe(FAMILY_ACCENT_COLORS[CALENDAR_COLOR_ACCENT[color]]);
  });
});
