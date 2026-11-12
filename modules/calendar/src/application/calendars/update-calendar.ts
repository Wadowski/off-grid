// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase, type ModuleTransaction } from "@offgrid/db";
import type { CalendarColor } from "../../domain/calendar-colors.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { recolorCalendar } from "../../infrastructure/calendars/recolor-calendar.js";
import { renameCalendar } from "../../infrastructure/calendars/rename-calendar.js";
import type { CalendarOutcome, CalendarRecord } from "../../types.js";

export interface CalendarChangeInput {
  readonly name?: string;
  readonly color?: CalendarColor;
}

// Row-level security hides calendars the caller cannot manage, so an update to
// them changes no row and reports not-found.
export const updateCalendar = (
  db: ModuleDatabase,
  userId: string,
  calendarId: string,
  input: CalendarChangeInput,
): Promise<CalendarOutcome<CalendarRecord>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const changed = await applyChanges(tx, calendarId, input);
    if (!changed) {
      return { outcome: "not-found" };
    }
    const updated = await findCalendar(tx, calendarId);
    return updated === null ? { outcome: "not-found" } : { outcome: "found", value: updated };
  });

const applyChanges = async (
  tx: ModuleTransaction,
  calendarId: string,
  input: CalendarChangeInput,
): Promise<boolean> => {
  let changed = true;
  if (input.name !== undefined) {
    changed = await renameCalendar(tx, { calendarId, name: input.name });
  }
  if (changed && input.color !== undefined) {
    changed = await recolorCalendar(tx, { calendarId, color: input.color });
  }
  return changed;
};
