// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";

export interface GuestCalendarFields {
  readonly calendarName?: string;
  readonly calendarColor?: string;
}

// A guest sees the name and colour of the calendar that holds a read-only event.
export const findGuestCalendarFields = async (
  tx: ModuleTransaction,
  calendarId: string,
): Promise<GuestCalendarFields> => {
  const calendar = await findCalendar(tx, calendarId);
  return { calendarName: calendar?.name, calendarColor: calendar?.color };
};
