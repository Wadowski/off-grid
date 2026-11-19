// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarEventGuestInvitedV1,
  calendarReminderDueV1,
  passwordChangedV1,
  recoveryCodeRegeneratedV1,
  type EventDefinition,
} from "@offgrid/contracts";
import type { NotificationCategory, NotificationType } from "@offgrid/contracts";
import type { z } from "zod";

export const NOTIFICATIONS_MODULE_NAME = "notifications";

export const INBOX_SUBSCRIBER_PREFIX = "notifications-inbox";

export const SUBSCRIBER_QUEUE_LIMIT = 100;

export const REALTIME_WORKER_NAME = "notifications-realtime";

export const REALTIME_CHANNEL_NAME = "realtime";

export const NOTIFICATION_CATEGORY_BY_TYPE: Record<NotificationType, NotificationCategory> = {
  "password-changed": "account-security",
  "recovery-code-regenerated": "account-security",
  "event-invited": "calendar",
  "event-reminder": "calendar",
};

type FactEvent = EventDefinition<string, number, z.ZodObject>;

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
  factNotice({
    event: calendarReminderDueV1,
    noticeType: "event-reminder",
    recipientKey: "userId",
    dataKeys: ["eventId"],
  }),
] as const;
