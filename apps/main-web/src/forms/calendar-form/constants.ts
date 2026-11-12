// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarColor } from "../../calendars/calendar-accents.js";

export const CALENDAR_COLOR_LABEL_TEXT_IDS = {
  blue: "calendar.colors.blue",
  teal: "calendar.colors.teal",
  green: "calendar.colors.green",
  amber: "calendar.colors.amber",
  rose: "calendar.colors.rose",
  violet: "calendar.colors.violet",
} as const satisfies Record<CalendarColor, string>;
