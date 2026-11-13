// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { calendarEventGuestInvitedV1 } from "./calendar-event-guest-invited-v1.js";
import { inviteEventGuestRequestSchema } from "./invite-event-guest-request-schema.js";

const ids = {
  eventId: "5b1d8c2e-6f0a-4a57-9d3e-2a1f0c9b7e10",
  guestUserId: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
};

describe("inviteEventGuestRequestSchema", () => {
  it("accepts a guest user id", () => {
    expect(inviteEventGuestRequestSchema.safeParse({ guestUserId: ids.guestUserId }).success).toBe(
      true,
    );
  });

  it("refuses unknown fields", () => {
    const result = inviteEventGuestRequestSchema.safeParse({
      guestUserId: ids.guestUserId,
      email: "guest@example.test",
    });
    expect(result.success).toBe(false);
  });
});

describe("calendarEventGuestInvitedV1 payload", () => {
  it("carries identifiers only", () => {
    expect(calendarEventGuestInvitedV1.schema.safeParse(ids).success).toBe(true);
  });

  it("refuses personal fields such as the title", () => {
    const result = calendarEventGuestInvitedV1.schema.safeParse({ ...ids, title: "Dinner" });
    expect(result.success).toBe(false);
  });
});
