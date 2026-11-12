// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { allDayBounds, lastDayOf, localDate, localMidnight } from "./all-day-bounds.js";

const hours = (from: Date, to: Date): number => (to.getTime() - from.getTime()) / 3_600_000;

describe("allDayBounds", () => {
  it("uses UTC midnight for UTC", () => {
    const bounds = allDayBounds({
      startDate: "2026-11-20",
      endDate: "2026-11-20",
      timeZone: "UTC",
    });

    expect(bounds.startsAt.toISOString()).toBe("2026-11-20T00:00:00.000Z");
    expect(bounds.endsAt.toISOString()).toBe("2026-11-21T00:00:00.000Z");
  });

  it("uses the zone's midnight for a zone ahead of UTC", () => {
    const bounds = allDayBounds({
      startDate: "2026-11-20",
      endDate: "2026-11-20",
      timeZone: "Europe/Warsaw",
    });

    expect(bounds.startsAt.toISOString()).toBe("2026-11-19T23:00:00.000Z");
    expect(bounds.endsAt.toISOString()).toBe("2026-11-20T23:00:00.000Z");
  });

  it("handles a zone with a half-hour offset", () => {
    expect(localMidnight("2026-11-20", "Asia/Kolkata").toISOString()).toBe(
      "2026-11-19T18:30:00.000Z",
    );
  });

  it("gives a 23 hour day on the spring-forward day", () => {
    const bounds = allDayBounds({
      startDate: "2026-03-29",
      endDate: "2026-03-29",
      timeZone: "Europe/Warsaw",
    });

    expect(hours(bounds.startsAt, bounds.endsAt)).toBe(23);
  });

  it("gives a 25 hour day on the fall-back day", () => {
    const bounds = allDayBounds({
      startDate: "2026-10-25",
      endDate: "2026-10-25",
      timeZone: "Europe/Warsaw",
    });

    expect(hours(bounds.startsAt, bounds.endsAt)).toBe(25);
  });

  it("covers a multi-day window from the first to the last day", () => {
    const bounds = allDayBounds({
      startDate: "2026-11-20",
      endDate: "2026-11-22",
      timeZone: "UTC",
    });

    expect(hours(bounds.startsAt, bounds.endsAt)).toBe(72);
  });
});

describe("lastDayOf and localDate", () => {
  it("returns the inclusive last day of a window in the caller's zone", () => {
    const bounds = allDayBounds({
      startDate: "2026-11-20",
      endDate: "2026-11-22",
      timeZone: "Europe/Warsaw",
    });

    expect(localDate(bounds.startsAt, "Europe/Warsaw")).toBe("2026-11-20");
    expect(lastDayOf(bounds.endsAt, "Europe/Warsaw")).toBe("2026-11-22");
  });
});
