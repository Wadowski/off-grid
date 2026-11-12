// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import {
  ALL_CALENDARS,
  distinctCalendarColors,
  filterByCalendar,
  sortByStart,
  splitAllDay,
} from "./events-by-calendar.js";

const events = [
  {
    id: "a",
    calendarId: "cal-1",
    calendarColor: "blue",
    isAllDay: false,
    startsAt: "2025-10-23T10:00:00Z",
  },
  {
    id: "b",
    calendarId: "cal-2",
    calendarColor: "teal",
    isAllDay: true,
    startsAt: "2025-10-23T00:00:00Z",
  },
  {
    id: "c",
    calendarId: "cal-1",
    calendarColor: "blue",
    isAllDay: false,
    startsAt: "2025-10-23T08:00:00Z",
  },
  {
    id: "d",
    calendarId: "cal-3",
    calendarColor: "amber",
    isAllDay: false,
    startsAt: "2025-10-23T09:00:00Z",
  },
  {
    id: "e",
    calendarId: "cal-4",
    calendarColor: "rose",
    isAllDay: false,
    startsAt: "2025-10-23T11:00:00Z",
  },
];

describe("events by calendar", () => {
  it("keeps every event for the all-calendars filter", () => {
    expect(filterByCalendar(events, ALL_CALENDARS)).toHaveLength(5);
  });

  it("keeps only the events of the chosen calendar", () => {
    expect(filterByCalendar(events, "cal-1").map((event) => event.id)).toEqual(["a", "c"]);
  });

  it("sorts events by start time without changing the input", () => {
    expect(sortByStart(events).map((event) => event.id)).toEqual(["b", "c", "d", "a", "e"]);
    expect(events[0]?.id).toBe("a");
  });

  it("separates all-day events from timed events", () => {
    const { allDay, timed } = splitAllDay(events);

    expect(allDay.map((event) => event.id)).toEqual(["b"]);
    expect(timed).toHaveLength(4);
  });

  it("lists each calendar colour once, up to the limit", () => {
    expect(distinctCalendarColors(events, 3)).toEqual(["blue", "teal", "amber"]);
    expect(distinctCalendarColors([], 3)).toEqual([]);
  });
});
