// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { userCreatedV1 } from "@offgrid/contracts";
import type { EventBus } from "@offgrid/event-bus";
import { createDefaultCalendar } from "../../application/calendars/create-default-calendar.js";

export const registerDefaultCalendarSubscribers = (eventBus: EventBus): void => {
  eventBus.subscribe({
    name: "calendar-default-calendar-from-user-created",
    event: userCreatedV1,
    runAs: "calendar",
    handler: (event, { tx }) => createDefaultCalendar(tx, event.payload.userId),
  });
};
