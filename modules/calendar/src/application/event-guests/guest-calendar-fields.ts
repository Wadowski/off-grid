// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarColorSchema, type CalendarColor } from "@offgrid/contracts";
import type { CalendarRecord } from "../../types.js";

export interface GuestCalendarFields {
  readonly calendarName?: string;
  readonly calendarColor?: CalendarColor;
}

// A guest sees the name and colour of the calendar that holds a read-only event.
// Pass null when the guest cannot see the calendar: then no name or colour is shown.
export const guestCalendarFields = (calendar: CalendarRecord | null): GuestCalendarFields =>
  calendar === null
    ? {}
    : { calendarName: calendar.name, calendarColor: calendarColorSchema.parse(calendar.color) };
