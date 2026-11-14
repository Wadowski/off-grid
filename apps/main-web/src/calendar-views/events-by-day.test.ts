// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { type DayEventSpan, eventsByDay } from "./events-by-day.js";

const timed = (id: string, startsAt: string, endsAt: string): DayEventSpan => ({
  id,
  isAllDay: false,
  startsAt,
  endsAt,
  startDate: null,
  endDate: null,
});

const allDay = (id: string, startDate: string, endDate: string): DayEventSpan => ({
  id,
  isAllDay: true,
  startsAt: `${startDate}T00:00:00Z`,
  endsAt: `${endDate}T00:00:00Z`,
  startDate,
  endDate,
});

const november = Array.from(
  { length: 30 },
  (_, index) => `2026-11-${String(index + 1).padStart(2, "0")}`,
);

const idsOn = (map: Map<string, DayEventSpan[]>, date: string): string[] =>
  (map.get(date) ?? []).map((event) => event.id);

describe("eventsByDay", () => {
  it("places a single-day timed event on its day only", () => {
    const map = eventsByDay(
      [timed("standup", "2026-11-18T09:00:00Z", "2026-11-18T09:30:00Z")],
      november,
      "UTC",
    );
    expect(idsOn(map, "2026-11-18")).toEqual(["standup"]);
    expect(idsOn(map, "2026-11-17")).toEqual([]);
  });

  it("places a multi-day all-day event on every day it spans", () => {
    const map = eventsByDay([allDay("retreat", "2026-11-10", "2026-11-12")], november, "UTC");
    expect(idsOn(map, "2026-11-10")).toEqual(["retreat"]);
    expect(idsOn(map, "2026-11-11")).toEqual(["retreat"]);
    expect(idsOn(map, "2026-11-12")).toEqual(["retreat"]);
    expect(idsOn(map, "2026-11-13")).toEqual([]);
  });

  it("places an event that started before the month on each day of the month it covers", () => {
    const map = eventsByDay([allDay("lodge", "2026-10-30", "2026-11-02")], november, "UTC");
    expect(map.has("2026-10-31")).toBe(false);
    expect(idsOn(map, "2026-11-01")).toEqual(["lodge"]);
    expect(idsOn(map, "2026-11-02")).toEqual(["lodge"]);
    expect(idsOn(map, "2026-11-03")).toEqual([]);
  });

  it("does not place a timed event that ends at 00:00 on the day it ends on", () => {
    const map = eventsByDay(
      [timed("late", "2026-11-18T22:00:00Z", "2026-11-19T00:00:00Z")],
      november,
      "UTC",
    );
    expect(idsOn(map, "2026-11-18")).toEqual(["late"]);
    expect(idsOn(map, "2026-11-19")).toEqual([]);
  });

  it("places a timed event that crosses midnight on both days", () => {
    const map = eventsByDay(
      [timed("night", "2026-11-18T22:00:00Z", "2026-11-19T01:00:00Z")],
      november,
      "UTC",
    );
    expect(idsOn(map, "2026-11-18")).toEqual(["night"]);
    expect(idsOn(map, "2026-11-19")).toEqual(["night"]);
  });

  it("uses the local day in the time zone, so a late evening event lands on the next UTC day", () => {
    const map = eventsByDay(
      [timed("dinner", "2026-11-18T23:30:00Z", "2026-11-19T00:30:00Z")],
      november,
      "Europe/Warsaw",
    );
    expect(idsOn(map, "2026-11-19")).toEqual(["dinner"]);
    expect(idsOn(map, "2026-11-18")).toEqual([]);
  });

  it("lists no dates outside the given dates", () => {
    const map = eventsByDay([allDay("lodge", "2026-10-30", "2026-11-02")], ["2026-11-01"], "UTC");
    expect([...map.keys()]).toEqual(["2026-11-01"]);
  });

  it("returns an empty map for no dates", () => {
    expect(eventsByDay([allDay("x", "2026-11-01", "2026-11-02")], [], "UTC").size).toBe(0);
  });
});
