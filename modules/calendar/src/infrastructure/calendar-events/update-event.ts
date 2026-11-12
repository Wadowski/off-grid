// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarEventChanges, CalendarEventRecord } from "../../types.js";
import { toEventRecord } from "./event-record.js";

export const updateEvent = async (
  tx: ModuleTransaction,
  eventId: string,
  changes: CalendarEventChanges,
): Promise<CalendarEventRecord> => {
  const row = await tx.calendarEvent.update({
    where: { eventId },
    data: {
      title: changes.title,
      location: changes.location,
      description: changes.description,
      calendarId: changes.calendarId,
      isAllDay: changes.isAllDay,
      startsAt: changes.startsAt,
      endsAt: changes.endsAt,
      version: { increment: 1 },
    },
  });
  return toEventRecord(row);
};
