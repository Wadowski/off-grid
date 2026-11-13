// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient, createCalendarClient } from "./index.js";

const BASE_URL = "http://localhost:3000/api";
const CALENDAR_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const EVENT_ID = "3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f";
const CALENDAR = {
  id: CALENDAR_ID,
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const calendarsWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const client = createApiClient({ baseUrl: BASE_URL, fetch: transport });
  return { calendars: createCalendarClient(client), transport };
};

describe("createCalendarClient", () => {
  it("lists the calendars the person can access", async () => {
    const { calendars, transport } = calendarsWith(jsonResponse({ calendars: [CALENDAR] }));

    await expect(calendars.listCalendars()).resolves.toEqual([CALENDAR]);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/calendars`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects a list response that does not match the calendar contract", async () => {
    const { calendars } = calendarsWith(jsonResponse({ calendars: [{ id: CALENDAR_ID }] }));

    await expect(calendars.listCalendars()).rejects.toThrow();
  });

  it("posts the name, color and optional family to create a calendar", async () => {
    const { calendars, transport } = calendarsWith(jsonResponse(CALENDAR, 201));

    await expect(calendars.createCalendar({ name: "Studio", color: "teal" })).resolves.toEqual(
      CALENDAR,
    );
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/calendars`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Studio", color: "teal" }),
      }),
    );
  });

  it("posts a timed event to the calendar it belongs to", async () => {
    const event = {
      id: EVENT_ID,
      calendarId: CALENDAR_ID,
      title: "Studio review",
      location: null,
      description: null,
      isAllDay: false,
      startsAt: "2026-11-16T09:00:00.000Z",
      endsAt: "2026-11-16T10:00:00.000Z",
      startDate: null,
      endDate: null,
      readOnly: false,
    };
    const { calendars, transport } = calendarsWith(jsonResponse(event, 201));
    const input = {
      title: "Studio review",
      isAllDay: false as const,
      startsAt: "2026-11-16T09:00:00.000Z",
      endsAt: "2026-11-16T10:00:00.000Z",
    };

    await expect(calendars.createCalendarEvent(CALENDAR_ID, input)).resolves.toEqual(event);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
      expect.objectContaining({ method: "POST", body: JSON.stringify(input) }),
    );
  });

  it("rejects a create-event response that does not match the event contract", async () => {
    const { calendars } = calendarsWith(jsonResponse({ id: EVENT_ID }, 201));

    await expect(
      calendars.createCalendarEvent(CALENDAR_ID, {
        title: "Studio review",
        isAllDay: false,
        startsAt: "2026-11-16T09:00:00.000Z",
        endsAt: "2026-11-16T10:00:00.000Z",
      }),
    ).rejects.toThrow();
  });

  it("rejects a create response that does not match the calendar contract", async () => {
    const { calendars } = calendarsWith(jsonResponse({ id: CALENDAR_ID }, 201));

    await expect(calendars.createCalendar({ name: "Studio", color: "teal" })).rejects.toThrow();
  });

  it("patches the calendar at its id with only the changed fields", async () => {
    const { calendars, transport } = calendarsWith(jsonResponse({ ...CALENDAR, color: "rose" }));

    await expect(calendars.updateCalendar(CALENDAR_ID, { color: "rose" })).resolves.toMatchObject({
      color: "rose",
    });
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/calendars/${CALENDAR_ID}`,
      expect.objectContaining({ method: "PATCH", body: '{"color":"rose"}' }),
    );
  });

  it("deletes the calendar at its id", async () => {
    const { calendars, transport } = calendarsWith(new Response(null, { status: 204 }));

    await expect(calendars.removeCalendar(CALENDAR_ID)).resolves.toBeUndefined();
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/calendars/${CALENDAR_ID}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("surfaces the status and code of a 409 default-calendar refusal", async () => {
    const { calendars } = calendarsWith(
      jsonResponse({ code: "DEFAULT_CALENDAR", message: "Default." }, 409),
    );

    const error = await calendars.removeCalendar(CALENDAR_ID).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: "DEFAULT_CALENDAR" });
  });
});

describe("createCalendarClient views and time zone", () => {
  const VIEW = {
    view: "agenda",
    startDate: "2026-11-16",
    endDate: "2026-11-22",
    days: [{ date: "2026-11-16", events: [] }],
  };

  it("gets the view for the given kind and date", async () => {
    const { calendars, transport } = calendarsWith(jsonResponse(VIEW));

    await expect(calendars.getCalendarView("agenda", "2026-11-18")).resolves.toEqual(VIEW);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/calendar/views/agenda?date=2026-11-18`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects a view response that does not match the view contract", async () => {
    const { calendars } = calendarsWith(jsonResponse({ view: "agenda" }));

    await expect(calendars.getCalendarView("agenda", "2026-11-18")).rejects.toThrow();
  });

  it("gets the time zone and whether the person has set one", async () => {
    const body = { timeZone: "Europe/Warsaw", isSet: true };
    const { calendars, transport } = calendarsWith(jsonResponse(body));

    await expect(calendars.getTimeZone()).resolves.toEqual(body);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/calendar/time-zone`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});
