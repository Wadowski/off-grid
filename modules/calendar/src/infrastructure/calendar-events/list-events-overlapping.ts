// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarViewEventRecord } from "../../types.js";
import { toEventRecord } from "./event-record.js";

export const listEventsOverlapping = async (
  tx: ModuleTransaction,
  range: { readonly startsAt: Date; readonly endsAt: Date },
): Promise<CalendarViewEventRecord[]> => {
  const rows = await tx.calendarEvent.findMany({
    where: {
      startsAt: { lt: range.endsAt },
      OR: [{ endsAt: { gt: range.startsAt } }, { startsAt: { gte: range.startsAt } }],
    },
    orderBy: [{ startsAt: "asc" }, { eventId: "asc" }],
  });
  const calendarIds = [...new Set(rows.map((row) => row.calendarId))];
  const calendars = await tx.calendar.findMany({ where: { calendarId: { in: calendarIds } } });
  const calendarById = new Map(calendars.map((calendar) => [calendar.calendarId, calendar]));
  return rows.flatMap((row) => {
    const calendar = calendarById.get(row.calendarId);
    if (calendar === undefined) {
      return [];
    }
    return [
      {
        ...toEventRecord(row),
        calendarName: calendar.name,
        calendarColor: calendar.color,
      },
    ];
  });
};
