// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarEventRecord, NewCalendarEvent } from "../../types.js";
import { toEventRecord } from "./event-record.js";

export const insertEvent = async (
  tx: ModuleTransaction,
  input: NewCalendarEvent,
): Promise<CalendarEventRecord> => {
  const row = await tx.calendarEvent.create({
    data: {
      eventId: input.eventId,
      calendarId: input.calendarId,
      familyId: input.familyId,
      userId: input.userId,
      title: input.title,
      location: input.location,
      description: input.description,
      isAllDay: input.isAllDay,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    },
  });
  return toEventRecord(row);
};
