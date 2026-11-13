// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase, type ModuleTransaction } from "@offgrid/db";
import { publishCalendarEventGuestInvited } from "../../events/event-guests/publish-calendar-event-guest-invited.js";
import { insertEventGuest } from "../../infrastructure/event-guests/insert-event-guest.js";
import { findEventGuest } from "../../infrastructure/event-guests/find-event-guest.js";
import { findEvent } from "../../infrastructure/calendar-events/find-event.js";
import { sharesFamilyWithCaller } from "../../infrastructure/family-membership/shares-family-with-caller.js";
import type { CalendarEventRecord } from "../../types.js";
import { EventGuestInviteRefusedError } from "../errors/event-guest-invite-refused-error.js";
import { EventGuestWriteDeniedError } from "../errors/event-guest-write-denied-error.js";

export type InviteEventGuestOutcome =
  | { readonly outcome: "invited" }
  | { readonly outcome: "already-invited" }
  | { readonly outcome: "not-found" };

export const inviteEventGuest = (
  db: ModuleDatabase,
  hostUserId: string,
  eventId: string,
  guestUserId: string,
): Promise<InviteEventGuestOutcome> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, hostUserId);
    const event = await findEvent(tx, eventId);
    if (event === null) {
      return { outcome: "not-found" };
    }
    await refuseGuestWrite(tx, event, hostUserId);
    assertInvitable(event, hostUserId, guestUserId);
    if (!(await sharesFamilyWithCaller(tx, guestUserId))) {
      throw new EventGuestInviteRefusedError();
    }
    const inserted = await insertEventGuest(tx, {
      eventId,
      guestUserId,
      userId: hostUserId,
    });
    if (!inserted) {
      return { outcome: "already-invited" };
    }
    await publishCalendarEventGuestInvited(tx, {
      hostUserId,
      sourceVersion: event.version,
      eventId,
      guestUserId,
      calendarId: event.calendarId,
    });
    return { outcome: "invited" };
  });

const refuseGuestWrite = async (
  tx: ModuleTransaction,
  event: CalendarEventRecord,
  userId: string,
): Promise<void> => {
  if (
    event.userId !== userId &&
    (await findEventGuest(tx, { eventId: event.eventId, guestUserId: userId }))
  ) {
    throw new EventGuestWriteDeniedError();
  }
};

const assertInvitable = (
  event: CalendarEventRecord,
  hostUserId: string,
  guestUserId: string,
): void => {
  if (event.familyId !== null || event.userId !== hostUserId || guestUserId === hostUserId) {
    throw new EventGuestInviteRefusedError();
  }
};
