// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findEvent } from "../../infrastructure/calendar-events/find-event.js";
import { findEventGuests } from "../../infrastructure/event-guests/find-event-guests.js";
import type { EventGuestListing } from "../../types.js";

export const listEventGuests = (
  db: ModuleDatabase,
  viewerUserId: string,
  eventId: string,
): Promise<EventGuestListing> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, viewerUserId);
    const event = await findEvent(tx, eventId);
    if (event === null) {
      return { outcome: "not-found" };
    }
    const rows = await findEventGuests(tx, eventId);
    return {
      outcome: "found",
      guests: rows.map((row) => ({
        userId: row.guestUserId,
        invitedAt: row.invitedAt.toISOString(),
      })),
    };
  });
