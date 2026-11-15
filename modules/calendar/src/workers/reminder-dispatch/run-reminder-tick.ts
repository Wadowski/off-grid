// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { claimDueReminders } from "../../infrastructure/reminders/claim-due-reminders.js";
import { publishCalendarReminderDue } from "../../events/event-reminders/publish-calendar-reminder-due.js";

export interface ReminderTickOptions {
  readonly now: Date;
  readonly batch: number;
}

// One tick, in one transaction: claim the due reminders, publish one fact for each, commit.
// A rollback leaves no fired marker and no fact, so the next tick retries the whole batch.
// Returns the number of reminders claimed.
export const runReminderTick = (
  db: ModuleDatabase,
  options: ReminderTickOptions,
): Promise<number> =>
  db.$transaction(async (tx) => {
    const claimed = await claimDueReminders(tx, options.now, options.batch);
    for (const reminder of claimed) {
      // Reminders are always written with their creator. A row without one cannot be delivered.
      if (reminder.userId === null) {
        continue;
      }
      await withUserContext(tx, reminder.userId);
      await publishCalendarReminderDue(tx, { eventId: reminder.eventId, userId: reminder.userId });
    }
    return claimed.length;
  });
