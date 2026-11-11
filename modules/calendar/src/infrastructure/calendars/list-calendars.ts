// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarRecord } from "../../types.js";

// Row-level security returns only the personal calendars of the current user
// and the family calendars of the families they belong to.
export const listCalendars = async (tx: ModuleTransaction): Promise<CalendarRecord[]> => {
  const rows = await tx.calendar.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return rows.map((row) => ({
    calendarId: row.calendarId,
    name: row.name,
    color: row.color,
    familyId: row.familyId,
    userId: row.userId,
    isDefault: row.isDefault,
  }));
};
