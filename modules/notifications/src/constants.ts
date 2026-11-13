// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarEventGuestInvitedV1,
  passwordChangedV1,
  recoveryCodeRegeneratedV1,
} from "@offgrid/contracts";

export const NOTIFICATIONS_MODULE_NAME = "notifications";

export const INBOX_SUBSCRIBER_PREFIX = "notifications-inbox";

export const FACT_NOTICES = [
  {
    event: passwordChangedV1,
    noticeType: "password-changed",
    recipientKey: "userId",
    dataKeys: [],
  },
  {
    event: recoveryCodeRegeneratedV1,
    noticeType: "recovery-code-regenerated",
    recipientKey: "userId",
    dataKeys: [],
  },
  {
    event: calendarEventGuestInvitedV1,
    noticeType: "event-invited",
    recipientKey: "guestUserId",
    dataKeys: ["eventId"],
  },
] as const;
