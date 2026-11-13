// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventGuestInvitedV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publishOwnedEvent } from "@offgrid/event-bus";

export const publishCalendarEventGuestInvited = (
  tx: ModuleTransaction,
  input: {
    readonly hostUserId: string;
    readonly sourceVersion: number;
    readonly eventId: string;
    readonly guestUserId: string;
    readonly calendarId: string;
  },
): Promise<number> =>
  publishOwnedEvent(
    rawSqlExecutor(tx),
    calendarEventGuestInvitedV1,
    { familyId: null, userId: input.hostUserId, sourceVersion: input.sourceVersion },
    { eventId: input.eventId, guestUserId: input.guestUserId, calendarId: input.calendarId },
  );
