// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import type { CalendarColor } from "../../domain/calendar-colors.js";
import { findFamilyMembership } from "../../infrastructure/family-membership/find-family-membership.js";
import { insertCalendar } from "../../infrastructure/calendars/insert-calendar.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import type { CalendarOutcome, CalendarRecord } from "../../types.js";

export interface NewCalendarInput {
  readonly name: string;
  readonly color: CalendarColor;
  readonly familyId?: string;
}

// A family the caller does not belong to looks the same as a family that does not exist.
export const createCalendar = (
  db: ModuleDatabase,
  userId: string,
  input: NewCalendarInput,
): Promise<CalendarOutcome<CalendarRecord>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    if (input.familyId !== undefined) {
      const member = await findFamilyMembership(tx, { familyId: input.familyId, userId });
      if (!member) {
        return { outcome: "not-found" };
      }
    }
    const calendarId = randomUUID();
    await insertCalendar(tx, {
      calendarId,
      familyId: input.familyId,
      userId: input.familyId === undefined ? userId : undefined,
      name: input.name,
      color: input.color,
    });
    const created = await findCalendar(tx, calendarId);
    return created === null ? { outcome: "not-found" } : { outcome: "found", value: created };
  });
