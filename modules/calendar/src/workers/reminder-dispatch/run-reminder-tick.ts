// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { claimDueReminders } from "../../infrastructure/reminders/claim-due-reminders.js";
import { publishCalendarReminderDue } from "../../events/event-reminders/publish-calendar-reminder-due.js";

interface ReminderTickOptions {
  readonly now: Date;
  readonly batch: number;
}

export const runReminderTick = (
  db: ModuleDatabase,
  options: ReminderTickOptions,
): Promise<number> =>
  db.$transaction(async (tx) => {
    const claimed = await claimDueReminders(tx, options.now, options.batch);
    for (const reminder of claimed) {
      await withUserContext(tx, reminder.userId);
      await publishCalendarReminderDue(tx, { eventId: reminder.eventId, userId: reminder.userId });
    }
    return claimed.length;
  });
