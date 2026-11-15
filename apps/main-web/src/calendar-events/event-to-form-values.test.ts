// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { eventToFormValues } from "./event-to-form-values.js";
import type { EventFormValues } from "./types.js";

const TIME_ZONE = "Europe/Warsaw";
const CALENDAR_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";

const timedForm = (overrides: Partial<EventFormValues> = {}): EventFormValues => ({
  title: "Studio review",
  calendarId: CALENDAR_ID,
  isAllDay: false,
  startDate: "2026-07-01",
  startTime: "12:00",
  endDate: "2026-07-01",
  endTime: "13:00",
  location: "",
  description: "",
  ...overrides,
});

describe("eventToFormValues", () => {
  it("prefills a timed event in the person's time zone", () => {
    const values = eventToFormValues(
      {
        calendarId: CALENDAR_ID,
        title: "Studio review",
        location: "West Gate",
        description: null,
        isAllDay: false,
        startsAt: "2026-07-01T10:30:00Z",
        endsAt: "2026-07-01T11:15:00Z",
        startDate: null,
        endDate: null,
      },
      TIME_ZONE,
    );

    expect(values).toEqual({
      ...timedForm({ startTime: "12:30", endTime: "13:15", location: "West Gate" }),
      description: "",
    });
  });

  it("prefills an all-day event with its inclusive dates", () => {
    const values = eventToFormValues(
      {
        calendarId: CALENDAR_ID,
        title: "Trip",
        location: null,
        description: null,
        isAllDay: true,
        startsAt: "2026-06-30T22:00:00Z",
        endsAt: "2026-07-02T22:00:00Z",
        startDate: "2026-07-01",
        endDate: "2026-07-02",
      },
      TIME_ZONE,
    );

    expect(values).toMatchObject({
      isAllDay: true,
      startDate: "2026-07-01",
      endDate: "2026-07-02",
    });
  });
});
