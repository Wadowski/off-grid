// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarRecord } from "../../types.js";

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
