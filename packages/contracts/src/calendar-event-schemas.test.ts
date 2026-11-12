// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { calendarEventCreatedV1 } from "./calendar-event-created-v1.js";
import { calendarEventUpdatedV1 } from "./calendar-event-updated-v1.js";
import { createCalendarEventRequestSchema } from "./create-calendar-event-request-schema.js";
import { timeZoneSchema } from "./calendar-time-zone-schema.js";
import { updateCalendarEventRequestSchema } from "./update-calendar-event-request-schema.js";

const timed = {
  title: "Standup",
  isAllDay: false,
  startsAt: "2026-11-20T09:00:00Z",
  endsAt: "2026-11-20T10:30:00+01:00",
};

describe("createCalendarEventRequestSchema", () => {
  it("accepts a timed event with offsets", () => {
    expect(createCalendarEventRequestSchema.safeParse(timed).success).toBe(true);
  });

  it("accepts an all-day event with calendar dates", () => {
    expect(
      createCalendarEventRequestSchema.safeParse({
        title: "Conference",
        isAllDay: true,
        startDate: "2026-11-20",
        endDate: "2026-11-21",
      }).success,
    ).toBe(true);
  });

  it("refuses a timed event that ends before it starts", () => {
    const result = createCalendarEventRequestSchema.safeParse({
      ...timed,
      endsAt: "2026-11-20T08:59:59Z",
    });
    expect(result.success).toBe(false);
  });

  it("allows a timed event that ends when it starts", () => {
    expect(
      createCalendarEventRequestSchema.safeParse({ ...timed, endsAt: timed.startsAt }).success,
    ).toBe(true);
  });

  it("refuses an all-day event whose end date is before its start date", () => {
    expect(
      createCalendarEventRequestSchema.safeParse({
        title: "Conference",
        isAllDay: true,
        startDate: "2026-11-21",
        endDate: "2026-11-20",
      }).success,
    ).toBe(false);
  });

  it("refuses unknown keys", () => {
    expect(createCalendarEventRequestSchema.safeParse({ ...timed, calendarId: "x" }).success).toBe(
      false,
    );
  });

  it("refuses an empty or over-long title", () => {
    expect(createCalendarEventRequestSchema.safeParse({ ...timed, title: "  " }).success).toBe(
      false,
    );
    expect(
      createCalendarEventRequestSchema.safeParse({ ...timed, title: "x".repeat(201) }).success,
    ).toBe(false);
  });

  it("does not echo the title in its error message", () => {
    const title = "Secret plans 42";
    const result = createCalendarEventRequestSchema.safeParse({
      ...timed,
      title: "",
      endsAt: "2026-11-19T00:00:00Z",
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues ?? [])).not.toContain(title);
  });
});

describe("updateCalendarEventRequestSchema", () => {
  it("requires at least one field", () => {
    expect(updateCalendarEventRequestSchema.safeParse({}).success).toBe(false);
  });

  it("accepts a single field and a null location", () => {
    expect(updateCalendarEventRequestSchema.safeParse({ title: "Lunch" }).success).toBe(true);
    expect(updateCalendarEventRequestSchema.safeParse({ location: null }).success).toBe(true);
  });

  it("refuses timed and all-day fields in one request", () => {
    expect(
      updateCalendarEventRequestSchema.safeParse({
        startsAt: "2026-11-20T09:00:00Z",
        startDate: "2026-11-20",
      }).success,
    ).toBe(false);
  });
});

describe("timeZoneSchema", () => {
  it("accepts IANA names and refuses unknown or long values", () => {
    expect(timeZoneSchema.safeParse("Europe/Warsaw").success).toBe(true);
    expect(timeZoneSchema.safeParse("UTC").success).toBe(true);
    expect(timeZoneSchema.safeParse("Mars/Olympus").success).toBe(false);
    expect(timeZoneSchema.safeParse("").success).toBe(false);
    expect(timeZoneSchema.safeParse("A".repeat(65)).success).toBe(false);
  });
});

describe("calendar event payloads", () => {
  const payload = {
    eventId: "0b7f3e1e-8f0a-4f57-9a55-6f2c3a1d9e10",
    calendarId: "5d0a2f4c-1f3b-4c8e-8a6e-2b9d7c1e4f11",
    title: "Standup",
    location: null,
    description: null,
    startsAt: "2026-11-20T09:00:00.000Z",
    endsAt: "2026-11-20T09:30:00.000Z",
    isAllDay: false,
    version: 1,
  };

  it("defines the created and updated events with the same payload", () => {
    expect(calendarEventCreatedV1.name).toBe("calendar-event-created-v1");
    expect(calendarEventUpdatedV1.name).toBe("calendar-event-updated-v1");
    expect(calendarEventCreatedV1.schema.safeParse(payload).success).toBe(true);
    expect(calendarEventUpdatedV1.schema.safeParse(payload).success).toBe(true);
  });
});
