// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { webCalendarClient } from "../api/web-api-client.js";
import { createCalendar, listCalendars, removeCalendar, updateCalendar } from "./calendar-api.js";
import type { Calendar } from "./types.js";

const ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f" as Calendar["id"];
const CALENDAR: Calendar = {
  id: ID,
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("calendar API", () => {
  it("returns the calendars the api client lists", async () => {
    const list = vi.spyOn(webCalendarClient, "listCalendars").mockResolvedValue([CALENDAR]);

    await expect(listCalendars()).resolves.toEqual([CALENDAR]);
    expect(list).toHaveBeenCalledOnce();
  });

  it("passes the name, color and optional family to the api client create method", async () => {
    const create = vi.spyOn(webCalendarClient, "createCalendar").mockResolvedValue(CALENDAR);

    await expect(createCalendar({ name: "Studio", color: "teal" })).resolves.toEqual(CALENDAR);
    expect(create).toHaveBeenCalledWith({ name: "Studio", color: "teal" });
  });

  it("passes the id and only the changed fields to the api client update method", async () => {
    const update = vi
      .spyOn(webCalendarClient, "updateCalendar")
      .mockResolvedValue({ ...CALENDAR, color: "rose" });

    await expect(updateCalendar(ID, { color: "rose" })).resolves.toMatchObject({ color: "rose" });
    expect(update).toHaveBeenCalledWith(ID, { color: "rose" });
  });

  it("passes the id to the api client delete method", async () => {
    const remove = vi.spyOn(webCalendarClient, "removeCalendar").mockResolvedValue(undefined);

    await expect(removeCalendar(ID)).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith(ID);
  });

  it("lets the status and code of a 409 default-calendar refusal reach the caller", async () => {
    vi.spyOn(webCalendarClient, "removeCalendar").mockRejectedValue(
      new ApiError(409, "DEFAULT_CALENDAR", "Default."),
    );

    const error = await removeCalendar(ID).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: "DEFAULT_CALENDAR" });
  });
});
