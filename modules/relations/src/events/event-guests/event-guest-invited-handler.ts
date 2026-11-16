// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { EventOf } from "@offgrid/event-bus";
import type { calendarEventGuestInvitedV1 } from "@offgrid/contracts";
import { EventWithoutOwnerError } from "../../application/errors/event-without-owner-error.js";
import { insertLinkableGuest } from "../../infrastructure/event-guests/insert-linkable-guest.js";
import { setOwnerContext } from "../../infrastructure/linkable-entities/set-owner-context.js";

export const eventGuestInvitedHandler = (
  db: ModuleDatabase,
  event: EventOf<typeof calendarEventGuestInvitedV1>,
): Promise<void> =>
  db.$transaction(async (tx) => {
    if (event.userId === null) {
      throw new EventWithoutOwnerError();
    }
    await setOwnerContext(tx, { familyId: null, userId: event.userId });
    await insertLinkableGuest(tx, {
      endpoint: { entityType: "calendar-event", entityId: event.payload.eventId },
      guestUserId: event.payload.guestUserId,
      hostUserId: event.userId,
    });
  });
