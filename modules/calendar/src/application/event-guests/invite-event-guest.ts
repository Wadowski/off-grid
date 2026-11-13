// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { publishCalendarEventGuestInvited } from "../../events/event-guests/publish-calendar-event-guest-invited.js";
import { findEvent } from "../../infrastructure/calendar-events/find-event.js";
import { insertEventGuest } from "../../infrastructure/event-guests/insert-event-guest.js";
import { sharesFamilyWithCaller } from "../../infrastructure/family-membership/shares-family-with-caller.js";
import type { CalendarEventRecord } from "../../types.js";
import { EventGuestInviteRefusedError } from "../errors/event-guest-invite-refused-error.js";
import { assertNotGuestWrite } from "./assert-not-guest-write.js";

export type InviteEventGuestOutcome =
  | { readonly outcome: "invited" }
  | { readonly outcome: "already-invited" }
  | { readonly outcome: "not-found" };

const assertInvitable = (
  event: CalendarEventRecord,
  hostUserId: string,
  guestUserId: string,
): void => {
  if (event.familyId !== null || event.userId !== hostUserId || guestUserId === hostUserId) {
    throw new EventGuestInviteRefusedError();
  }
};

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
    await assertNotGuestWrite(tx, event, hostUserId);
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
