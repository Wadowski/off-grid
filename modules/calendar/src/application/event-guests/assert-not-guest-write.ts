// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findEventGuest } from "../../infrastructure/event-guests/find-event-guest.js";
import type { CalendarEventRecord } from "../../types.js";
import { EventGuestWriteDeniedError } from "../errors/event-guest-write-denied-error.js";

export const assertNotGuestWrite = async (
  tx: ModuleTransaction,
  event: CalendarEventRecord,
  userId: string,
): Promise<void> => {
  if (event.userId === userId) {
    return;
  }
  if (await findEventGuest(tx, { eventId: event.eventId, guestUserId: userId })) {
    throw new EventGuestWriteDeniedError();
  }
};
