// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { calendarViewParamsSchema } from "./calendar-view-params-schema.js";
import { calendarViewSchema } from "./calendar-view-schema.js";

const event = {
  id: "5b1d8c2e-6f0a-4a57-9d3e-2a1f0c9b7e10",
  calendarId: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
  calendarName: "Work",
  calendarColor: "blue",
  title: "Standup",
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2026-11-20T09:00:00Z",
  endsAt: "2026-11-20T09:30:00Z",
  startDate: null,
  endDate: null,
};

describe("calendarViewParamsSchema", () => {
  it("accepts each view with a calendar date", () => {
    for (const view of ["agenda", "day", "week", "month"]) {
      expect(calendarViewParamsSchema.safeParse({ view, date: "2026-11-20" }).success).toBe(true);
    }
  });

  it("refuses an unknown view", () => {
    expect(calendarViewParamsSchema.safeParse({ view: "year", date: "2026-11-20" }).success).toBe(
      false,
    );
  });

  it("refuses a missing or malformed date", () => {
    expect(calendarViewParamsSchema.safeParse({ view: "week" }).success).toBe(false);
    expect(calendarViewParamsSchema.safeParse({ view: "week", date: "2026-02-30" }).success).toBe(
      false,
    );
    expect(calendarViewParamsSchema.safeParse({ view: "week", date: "20-11-2026" }).success).toBe(
      false,
    );
  });
});

describe("calendarViewSchema", () => {
  it("accepts a view with one entry per day and events carrying calendar name and color", () => {
    const result = calendarViewSchema.safeParse({
      view: "week",
      startDate: "2026-11-16",
      endDate: "2026-11-22",
      days: [{ date: "2026-11-16", events: [event] }],
    });
    expect(result.success).toBe(true);
  });

  it("refuses an event without a calendar color", () => {
    const withoutColor = { ...event, calendarColor: undefined };
    const result = calendarViewSchema.safeParse({
      view: "day",
      startDate: "2026-11-20",
      endDate: "2026-11-20",
      days: [{ date: "2026-11-20", events: [withoutColor] }],
    });
    expect(result.success).toBe(false);
  });

  it("refuses an unknown calendar color", () => {
    const result = calendarViewSchema.safeParse({
      view: "day",
      startDate: "2026-11-20",
      endDate: "2026-11-20",
      days: [{ date: "2026-11-20", events: [{ ...event, calendarColor: "pink" }] }],
    });
    expect(result.success).toBe(false);
  });
});
