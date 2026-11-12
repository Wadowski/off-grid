// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { userCreatedV1 } from "@offgrid/contracts";
import { createDefaultCalendar } from "../../application/calendars/create-default-calendar.js";
import type { CalendarSubscriberContext } from "../../types.js";

export const registerDefaultCalendarSubscribers = (context: CalendarSubscriberContext): void => {
  context.eventBus.subscribe({
    name: "calendar-default-calendar-from-user-created",
    event: userCreatedV1,
    runAs: "calendar",
    handler: (event) =>
      context.db.$transaction((tx) => createDefaultCalendar(tx, event.payload.userId)),
  });
};
