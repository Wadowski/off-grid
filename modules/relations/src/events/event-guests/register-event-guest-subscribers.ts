// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventGuestInvitedV1 } from "@offgrid/contracts";
import type { RelationsSubscriberContext } from "../../types.js";
import { EVENT_GUEST_SUBSCRIBER } from "../../constants.js";
import { eventGuestInvitedHandler } from "./event-guest-invited-handler.js";

export const registerEventGuestSubscribers = (context: RelationsSubscriberContext): void => {
  context.eventBus.subscribeToEvents({
    name: EVENT_GUEST_SUBSCRIBER,
    events: [calendarEventGuestInvitedV1],
    runAs: "relations",
    onFailure: "halt",
    handler: (event) => eventGuestInvitedHandler(context.db, event),
  });
};
