// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createCalendarEventRequestSchema } from "./create-calendar-event-request-schema.js";
import { reminderOffsetsSchema } from "./reminder-offsets-schema.js";
import { updateCalendarEventRequestSchema } from "./update-calendar-event-request-schema.js";

const accepts = (offsets: unknown) => reminderOffsetsSchema.safeParse(offsets).success;

describe("reminderOffsetsSchema", () => {
  it("accepts the bounds 0 and 40320 and an empty list", () => {
    expect(accepts([0, 40320])).toBe(true);
    expect(accepts([])).toBe(true);
  });

  it("refuses an offset below 0 or above 40320", () => {
    expect(accepts([-1])).toBe(false);
    expect(accepts([40321])).toBe(false);
  });

  it("refuses a fractional offset", () => {
    expect(accepts([15.5])).toBe(false);
  });

  it("accepts five offsets and refuses a sixth", () => {
    expect(accepts([0, 5, 15, 60, 1440])).toBe(true);
    expect(accepts([0, 5, 15, 60, 1440, 2880])).toBe(false);
  });

  it("refuses duplicate offsets", () => {
    expect(accepts([15, 15])).toBe(false);
  });
});

describe("reminder offsets on event requests", () => {
  it("accepts offsets on create and update", () => {
    expect(
      createCalendarEventRequestSchema.safeParse({
        title: "Standup",
        isAllDay: false,
        startsAt: "2026-11-20T09:00:00Z",
        endsAt: "2026-11-20T09:30:00Z",
        reminderOffsetsMinutes: [15, 60],
      }).success,
    ).toBe(true);
    expect(
      updateCalendarEventRequestSchema.safeParse({ reminderOffsetsMinutes: [] }).success,
    ).toBe(true);
  });

  it("refuses an invalid offset on update", () => {
    expect(
      updateCalendarEventRequestSchema.safeParse({ reminderOffsetsMinutes: [-5] }).success,
    ).toBe(false);
  });
});
