// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import { createCalendar, listCalendars, removeCalendar, updateCalendar } from "./calendar-api.js";

const ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const CALENDAR = { id: ID, name: "Studio", color: "teal", familyId: null, isDefault: false };

const stubFetch = (response: Response) => {
  const fetchMock = vi.fn(async () => response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const sentRequest = (fetchMock: ReturnType<typeof stubFetch>) => {
  const [input, init] = fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit];
  return { url: String(input), method: init.method, body: init.body };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("calendar API", () => {
  it("lists the calendars the person can access", async () => {
    const fetchMock = stubFetch(jsonResponse({ status: 200, body: { calendars: [CALENDAR] } }));

    await expect(listCalendars()).resolves.toEqual([CALENDAR]);
    expect(sentRequest(fetchMock).method).toBe("GET");
    expect(sentRequest(fetchMock).url).toMatch(/\/calendars$/);
  });

  it("posts the name, color and optional family to create a calendar", async () => {
    const fetchMock = stubFetch(jsonResponse({ status: 201, body: CALENDAR }));

    await expect(createCalendar({ name: "Studio", color: "teal" })).resolves.toEqual(CALENDAR);
    expect(sentRequest(fetchMock)).toMatchObject({
      method: "POST",
      url: expect.stringMatching(/\/calendars$/),
      body: JSON.stringify({ name: "Studio", color: "teal" }),
    });
  });

  it("patches the calendar at its id with only the changed fields", async () => {
    const fetchMock = stubFetch(
      jsonResponse({ status: 200, body: { ...CALENDAR, color: "rose" } }),
    );

    await updateCalendar(ID, { color: "rose" });
    expect(sentRequest(fetchMock)).toMatchObject({
      method: "PATCH",
      url: expect.stringMatching(new RegExp(`/calendars/${ID}$`)),
      body: JSON.stringify({ color: "rose" }),
    });
  });

  it("deletes the calendar at its id", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));

    await removeCalendar(ID);
    expect(sentRequest(fetchMock)).toMatchObject({
      method: "DELETE",
      url: expect.stringMatching(new RegExp(`/calendars/${ID}$`)),
    });
  });

  it("rejects a response that does not match the calendar contract", async () => {
    stubFetch(jsonResponse({ status: 201, body: { id: ID } }));

    await expect(createCalendar({ name: "Studio", color: "teal" })).rejects.toThrow();
  });

  it("surfaces the status and code of a 409 default-calendar refusal", async () => {
    stubFetch(
      jsonResponse({ status: 409, body: { code: "DEFAULT_CALENDAR", message: "Default." } }),
    );

    const error = await removeCalendar(ID).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: "DEFAULT_CALENDAR" });
  });
});
