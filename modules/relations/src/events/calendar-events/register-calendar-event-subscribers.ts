// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarEventCreatedV1,
  calendarEventRemovedV1,
  calendarEventUpdatedV1,
} from "@offgrid/contracts";
import type { RelationsSubscriberContext } from "../../types.js";
import { CALENDAR_EVENT_SUBSCRIBER } from "../../constants.js";
import { calendarEventProjectionHandler } from "./calendar-event-projection-handler.js";

export const registerCalendarEventSubscribers = (context: RelationsSubscriberContext): void => {
  context.eventBus.subscribeToEvents({
    name: CALENDAR_EVENT_SUBSCRIBER,
    events: [calendarEventCreatedV1, calendarEventUpdatedV1, calendarEventRemovedV1],
    runAs: "relations",
    onFailure: "halt",
    handler: (event) => calendarEventProjectionHandler(context.db, event),
  });
};
