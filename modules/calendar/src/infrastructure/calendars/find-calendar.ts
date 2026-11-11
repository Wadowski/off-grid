// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarRecord } from "../../types.js";

export const findCalendar = async (
  tx: ModuleTransaction,
  calendarId: string,
): Promise<CalendarRecord | null> => {
  const row = await tx.calendar.findUnique({ where: { calendarId } });
  if (row === null) {
    return null;
  }
  return {
    calendarId: row.calendarId,
    name: row.name,
    color: row.color,
    familyId: row.familyId,
    userId: row.userId,
    isDefault: row.isDefault,
  };
};
