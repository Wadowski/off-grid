// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarAccentColor } from "../../calendars/calendar-accents.js";
import type { CalendarEventDetails } from "./types.js";

export const eventAccentOf = (event: CalendarEventDetails): string | undefined =>
  event.calendarColor === undefined
    ? undefined
    : calendarAccentColor(event.calendarColor).background;
