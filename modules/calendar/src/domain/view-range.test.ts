// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { viewRange } from "./view-range.js";

const hours = (from: Date, to: Date): number => (to.getTime() - from.getTime()) / 3_600_000;

describe("viewRange", () => {
  it("starts a week view on the Monday of the week, Monday to Sunday", () => {
    const range = viewRange({ view: "week", date: "2026-11-18", timeZone: "UTC" });
    expect(range.startDate).toBe("2026-11-16");
    expect(range.endDate).toBe("2026-11-22");
  });

  it("keeps a Monday date in its own week", () => {
    const range = viewRange({ view: "week", date: "2026-11-16", timeZone: "UTC" });
    expect(range.startDate).toBe("2026-11-16");
    expect(range.endDate).toBe("2026-11-22");
  });

  it("keeps a Sunday date in the week that started on the Monday before it", () => {
    const range = viewRange({ view: "week", date: "2026-11-22", timeZone: "UTC" });
    expect(range.startDate).toBe("2026-11-16");
    expect(range.endDate).toBe("2026-11-22");
  });

  it("covers seven days for the agenda, starting on the given date", () => {
    const range = viewRange({ view: "agenda", date: "2026-11-18", timeZone: "UTC" });
    expect(range.startDate).toBe("2026-11-18");
    expect(range.endDate).toBe("2026-11-24");
  });

  it("covers only the given day for the day view", () => {
    const range = viewRange({ view: "day", date: "2026-11-18", timeZone: "UTC" });
    expect(range.startDate).toBe("2026-11-18");
    expect(range.endDate).toBe("2026-11-18");
  });

  it("covers the days of the calendar month only", () => {
    const november = viewRange({ view: "month", date: "2026-11-12", timeZone: "UTC" });
    expect(november.startDate).toBe("2026-11-01");
    expect(november.endDate).toBe("2026-11-30");

    const december = viewRange({ view: "month", date: "2026-12-05", timeZone: "UTC" });
    expect(december.startDate).toBe("2026-12-01");
    expect(december.endDate).toBe("2026-12-31");
  });

  it("knows the length of February in a leap year", () => {
    const range = viewRange({ view: "month", date: "2028-02-10", timeZone: "UTC" });
    expect(range.startDate).toBe("2028-02-01");
    expect(range.endDate).toBe("2028-02-29");
  });

  it("starts and ends at the zone's local midnight", () => {
    const range = viewRange({ view: "day", date: "2026-11-20", timeZone: "Europe/Warsaw" });
    expect(range.startsAt.toISOString()).toBe("2026-11-19T23:00:00.000Z");
    expect(range.endsAt.toISOString()).toBe("2026-11-20T23:00:00.000Z");
  });

  it("gives a 23-hour day on the spring change in Europe/Warsaw", () => {
    const range = viewRange({ view: "day", date: "2026-03-29", timeZone: "Europe/Warsaw" });
    expect(hours(range.startsAt, range.endsAt)).toBe(23);
  });

  it("gives a 25-hour day on the autumn change in Europe/Warsaw", () => {
    const range = viewRange({ view: "day", date: "2026-10-25", timeZone: "Europe/Warsaw" });
    expect(hours(range.startsAt, range.endsAt)).toBe(25);
  });

  it("gives a 169-hour week that contains the autumn change in Europe/Warsaw", () => {
    const range = viewRange({ view: "week", date: "2026-10-25", timeZone: "Europe/Warsaw" });
    expect(range.startDate).toBe("2026-10-19");
    expect(range.endDate).toBe("2026-10-25");
    expect(hours(range.startsAt, range.endsAt)).toBe(169);
  });

  it("gives a 25-hour day on the autumn change in America/New_York", () => {
    const range = viewRange({ view: "day", date: "2026-11-01", timeZone: "America/New_York" });
    expect(hours(range.startsAt, range.endsAt)).toBe(25);
  });

  it("gives a 169-hour week that contains the autumn change in America/New_York", () => {
    const range = viewRange({ view: "week", date: "2026-11-01", timeZone: "America/New_York" });
    expect(range.startDate).toBe("2026-10-26");
    expect(range.endDate).toBe("2026-11-01");
    expect(hours(range.startsAt, range.endsAt)).toBe(169);
  });
});
