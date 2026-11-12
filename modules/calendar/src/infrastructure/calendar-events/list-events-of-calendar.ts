// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarEventRecord } from "../../types.js";
import { toEventRecord } from "./event-record.js";

export const listEventsOfCalendar = async (
  tx: ModuleTransaction,
  calendarId: string,
): Promise<CalendarEventRecord[]> => {
  const rows = await tx.calendarEvent.findMany({
    where: { calendarId },
    orderBy: [{ startsAt: "asc" }, { eventId: "asc" }],
  });
  return rows.map(toEventRecord);
};
