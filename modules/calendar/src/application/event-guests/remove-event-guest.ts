// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findEvent } from "../../infrastructure/calendar-events/find-event.js";
import { deleteEventGuest } from "../../infrastructure/event-guests/delete-event-guest.js";
import { EventGuestWriteDeniedError } from "../errors/event-guest-write-denied-error.js";
import { assertNotGuestWrite } from "./assert-not-guest-write.js";
import type { RemoveEventGuestOutcome } from "../../types.js";

export const removeEventGuest = (
  db: ModuleDatabase,
  hostUserId: string,
  eventId: string,
  guestUserId: string,
): Promise<RemoveEventGuestOutcome> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, hostUserId);
    const event = await findEvent(tx, eventId);
    if (event === null) {
      return { outcome: "not-found" };
    }
    await assertNotGuestWrite(tx, event, hostUserId);
    if (event.userId !== hostUserId) {
      throw new EventGuestWriteDeniedError();
    }
    await deleteEventGuest(tx, { eventId, guestUserId });
    return { outcome: "removed" };
  });
