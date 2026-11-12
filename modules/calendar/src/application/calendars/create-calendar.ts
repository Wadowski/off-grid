// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import type { NewCalendarInput } from "../../types.js";
import { isFamilyMember } from "../../infrastructure/family-membership/is-family-member.js";
import { insertCalendar } from "../../infrastructure/calendars/insert-calendar.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import type { CalendarOutcome, CalendarRecord } from "../../types.js";

export const createCalendar = (
  db: ModuleDatabase,
  userId: string,
  input: NewCalendarInput,
): Promise<CalendarOutcome<CalendarRecord>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    if (input.familyId !== undefined) {
      const member = await isFamilyMember(tx, { familyId: input.familyId, userId });
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
