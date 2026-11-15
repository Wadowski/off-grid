// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { registerDefaultCalendarSubscribers } from "./events/default-calendar/register-default-calendar-subscribers.js";
import { registerFamilyMembershipSubscribers } from "./events/family-membership/register-family-membership-subscribers.js";
import { registerCalendarRoutes } from "./http/register-calendar-routes.js";
import { createReminderDispatchWorker } from "./workers/reminder-dispatch/create-reminder-dispatch-worker.js";
import type { CalendarSubscriberContext, CalendarWorkerContext } from "./types.js";

const REMINDER_TICK_INTERVAL_MS = 30_000;

export const calendarModule = {
  name: "calendar",
  registerRoutes: registerCalendarRoutes,
  registerSubscribers: (context: CalendarSubscriberContext) => {
    registerDefaultCalendarSubscribers(context);
    registerFamilyMembershipSubscribers(context);
  },
  workers: (context: CalendarWorkerContext) => [
    createReminderDispatchWorker({
      db: context.db,
      logger: context.logger,
      now: () => new Date(),
      intervalMs: REMINDER_TICK_INTERVAL_MS,
    }),
  ],
};
