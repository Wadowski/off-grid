// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { eventGuestListSchema } from "./event-guest-list-schema.js";
import { eventGuestParamsSchema } from "./event-guest-params-schema.js";

const guestUserId = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
const eventId = "5b1d8c2e-6f0a-4a57-9d3e-2a1f0c9b7e10";

describe("eventGuestListSchema", () => {
  it("accepts guests with their invite time", () => {
    const result = eventGuestListSchema.safeParse({
      guests: [{ userId: guestUserId, invitedAt: "2026-11-20T10:00:00.000Z" }],
    });
    expect(result.success).toBe(true);
  });

  it("refuses a guest without an invite time", () => {
    expect(eventGuestListSchema.safeParse({ guests: [{ userId: guestUserId }] }).success).toBe(
      false,
    );
  });
});

describe("eventGuestParamsSchema", () => {
  it("accepts an event id and a guest user id", () => {
    expect(eventGuestParamsSchema.safeParse({ id: eventId, guestUserId }).success).toBe(true);
  });

  it("refuses a missing guest user id", () => {
    expect(eventGuestParamsSchema.safeParse({ id: eventId }).success).toBe(false);
  });
});
