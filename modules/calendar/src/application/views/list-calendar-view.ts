// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewKind } from "@offgrid/contracts";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { DEFAULT_TIME_ZONE } from "../../domain/time-zone.js";
import { viewRange } from "../../domain/view-range.js";
import { listEventsOverlapping } from "../../infrastructure/calendar-events/list-events-overlapping.js";
import { findTimeZone } from "../../infrastructure/time-zones/find-time-zone.js";
import { findReadOnlyEventIds } from "../event-guests/find-read-only-event-ids.js";
import { toEventView } from "../calendar-events/event-view.js";
import { buildViewDays, type ViewDay } from "./build-view-days.js";

export interface CalendarViewResult {
  readonly view: CalendarViewKind;
  readonly startDate: string;
  readonly endDate: string;
  readonly days: ViewDay[];
}

export const listCalendarView = (
  db: ModuleDatabase,
  userId: string,
  input: { readonly view: CalendarViewKind; readonly date: string },
): Promise<CalendarViewResult> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const timeZone = (await findTimeZone(tx, userId)) ?? DEFAULT_TIME_ZONE;
    const range = viewRange({ view: input.view, date: input.date, timeZone });
    const records = await listEventsOverlapping(tx, range);
    const readOnlyEventIds = await findReadOnlyEventIds(tx, { guestUserId: userId, records });
    const events = records.map((record) => ({
      ...toEventView(record, timeZone, readOnlyEventIds.has(record.eventId)),
      calendarName: record.calendarName,
      calendarColor: record.calendarColor,
    }));
    return {
      view: input.view,
      startDate: range.startDate,
      endDate: range.endDate,
      days: buildViewDays({ startDate: range.startDate, endDate: range.endDate, timeZone, events }),
    };
  });
