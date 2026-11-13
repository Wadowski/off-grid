// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarEventGuestInvitedV1,
  passwordChangedV1,
  recoveryCodeRegeneratedV1,
  type EventDefinition,
} from "@offgrid/contracts";
import type { z } from "zod";

export const NOTIFICATIONS_MODULE_NAME = "notifications";

export const INBOX_SUBSCRIBER_PREFIX = "notifications-inbox";

type FactEvent = EventDefinition<string, number, z.ZodObject>;

// The keys of an event's payload, so that a misspelt recipient or data key fails to compile.
type PayloadKey<Event extends FactEvent> = keyof z.infer<Event["schema"]> & string;

interface FactNotice<Event extends FactEvent> {
  readonly event: Event;
  readonly noticeType: string;
  readonly recipientKey: PayloadKey<Event>;
  readonly dataKeys: readonly PayloadKey<Event>[];
}

const factNotice = <Event extends FactEvent>(notice: FactNotice<Event>): FactNotice<Event> =>
  notice;

export const FACT_NOTICES = [
  factNotice({
    event: passwordChangedV1,
    noticeType: "password-changed",
    recipientKey: "userId",
    dataKeys: [],
  }),
  factNotice({
    event: recoveryCodeRegeneratedV1,
    noticeType: "recovery-code-regenerated",
    recipientKey: "userId",
    dataKeys: [],
  }),
  factNotice({
    event: calendarEventGuestInvitedV1,
    noticeType: "event-invited",
    recipientKey: "guestUserId",
    dataKeys: ["eventId"],
  }),
] as const;
