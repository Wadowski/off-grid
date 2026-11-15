// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import {
  defaultEventForm,
  eventToFormValues,
  toCreateEventRequest,
  toUpdateEventRequest,
  withField,
} from "./event-form.js";
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

describe("defaultEventForm", () => {
  it("opens on the first full hour after now in the person's time zone, lasting one hour", () => {
    const form = defaultEventForm({
      now: new Date("2026-07-01T09:20:00Z"),
      calendarId: CALENDAR_ID,
      timeZone: TIME_ZONE,
    });

    expect(form).toMatchObject({
      title: "",
      calendarId: CALENDAR_ID,
      isAllDay: false,
      startDate: "2026-07-01",
      startTime: "12:00",
      endDate: "2026-07-01",
      endTime: "13:00",
    });
  });

  it("opens on the following hour when now is exactly on a full hour", () => {
    const form = defaultEventForm({
      now: new Date("2026-07-01T10:00:00Z"),
      calendarId: CALENDAR_ID,
      timeZone: TIME_ZONE,
    });

    expect(form).toMatchObject({ startDate: "2026-07-01", startTime: "13:00", endTime: "14:00" });
  });

  it("rolls over to the next day when the next full hour is midnight", () => {
    const form = defaultEventForm({
      now: new Date("2026-07-01T21:30:00Z"),
      calendarId: CALENDAR_ID,
      timeZone: TIME_ZONE,
    });

    expect(form).toMatchObject({ startDate: "2026-07-02", startTime: "00:00" });
  });
});

describe("toCreateEventRequest", () => {
  it("builds a timed request with UTC instants and no empty optional fields", () => {
    const result = toCreateEventRequest(timedForm({ location: "  ", description: "" }), TIME_ZONE);

    expect(result).toEqual({
      ok: true,
      request: {
        title: "Studio review",
        isAllDay: false,
        startsAt: "2026-07-01T10:00:00.000Z",
        endsAt: "2026-07-01T11:00:00.000Z",
      },
    });
  });

  it("keeps trimmed location and description when they are filled in", () => {
    const result = toCreateEventRequest(
      timedForm({ location: " Studio ", description: " Bring notes " }),
      TIME_ZONE,
    );

    expect(result).toMatchObject({
      ok: true,
      request: { location: "Studio", description: "Bring notes" },
    });
  });

  it("builds an all-day request with dates instead of instants", () => {
    const result = toCreateEventRequest(
      timedForm({
        isAllDay: true,
        startDate: "2026-07-01",
        endDate: "2026-07-03",
      }),
      TIME_ZONE,
    );

    expect(result).toEqual({
      ok: true,
      request: {
        title: "Studio review",
        isAllDay: true,
        startDate: "2026-07-01",
        endDate: "2026-07-03",
      },
    });
  });

  it("reports an empty title on the title field", () => {
    expect(toCreateEventRequest(timedForm({ title: "   " }), TIME_ZONE)).toEqual({
      ok: false,
      errors: { title: "titleRequired" },
    });
  });

  it("reports an end before the start on the end field, with the server's rule", () => {
    expect(toCreateEventRequest(timedForm({ endTime: "11:00" }), TIME_ZONE)).toEqual({
      ok: false,
      errors: { end: "endsBeforeStart" },
    });
  });

  it("reports a title over 200 characters as too long, not as missing", () => {
    expect(toCreateEventRequest(timedForm({ title: "a".repeat(201) }), TIME_ZONE)).toEqual({
      ok: false,
      errors: { title: "titleTooLong" },
    });
  });

  it("reports an incomplete date or time as an incomplete form", () => {
    expect(toCreateEventRequest(timedForm({ startTime: "" }), TIME_ZONE)).toEqual({
      ok: false,
      errors: { form: "incomplete" },
    });
  });
});

describe("withField", () => {
  it("changes one field and keeps the rest", () => {
    const form = timedForm();

    expect(withField(form, "title", "Lunch")).toEqual({ ...form, title: "Lunch" });
  });
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

describe("toUpdateEventRequest", () => {
  it("sends only the title when only the title changed", () => {
    const initial = timedForm();
    const result = toUpdateEventRequest(
      initial,
      withField(initial, "title", "Studio retro"),
      TIME_ZONE,
    );

    expect(result).toEqual({ ok: true, request: { title: "Studio retro" } });
  });

  it("sends nothing when no field changed", () => {
    const initial = timedForm();
    expect(toUpdateEventRequest(initial, initial, TIME_ZONE)).toEqual({
      ok: true,
      request: undefined,
    });
  });

  it("sends null for a location or note that was cleared", () => {
    const initial = timedForm({ location: "West Gate", description: "Deck" });
    const result = toUpdateEventRequest(
      initial,
      { ...initial, location: "  ", description: "" },
      TIME_ZONE,
    );

    expect(result).toEqual({ ok: true, request: { location: null, description: null } });
  });

  it("sends only the end time when only the end changed", () => {
    const initial = timedForm();
    const result = toUpdateEventRequest(initial, withField(initial, "endTime", "14:00"), TIME_ZONE);

    expect(result).toEqual({
      ok: true,
      request: { endsAt: "2026-07-01T12:00:00.000Z" },
    });
  });

  it("refuses an edit that ends before it starts with the same error as a new event", () => {
    const initial = timedForm();
    const result = toUpdateEventRequest(initial, withField(initial, "endTime", "11:00"), TIME_ZONE);

    expect(result).toEqual({ ok: false, errors: { end: "endsBeforeStart" } });
  });
});
