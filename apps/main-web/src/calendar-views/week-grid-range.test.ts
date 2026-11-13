// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { columnSpanInWeek, weekGridRange } from "./week-grid-range.js";

describe("weekGridRange", () => {
  it("shows 08:00 to 21:00 when no event falls outside it", () => {
    expect(weekGridRange([], "UTC")).toEqual({ startHour: 8, endHour: 21 });
    expect(
      weekGridRange([{ startsAt: "2025-10-23T10:00:00Z", endsAt: "2025-10-23T11:00:00Z" }], "UTC"),
    ).toEqual({ startHour: 8, endHour: 21 });
  });

  it("widens to the earliest start and the latest end", () => {
    expect(
      weekGridRange(
        [
          { startsAt: "2025-10-23T06:15:00Z", endsAt: "2025-10-23T07:00:00Z" },
          { startsAt: "2025-10-23T22:00:00Z", endsAt: "2025-10-23T22:40:00Z" },
        ],
        "UTC",
      ),
    ).toEqual({ startHour: 6, endHour: 23 });
  });

  it("reads the hours in the caller's zone", () => {
    expect(
      weekGridRange(
        [{ startsAt: "2025-10-23T06:30:00Z", endsAt: "2025-10-23T07:00:00Z" }],
        "Europe/Warsaw",
      ),
    ).toEqual({ startHour: 8, endHour: 21 });
  });
});

describe("columnSpanInWeek", () => {
  const week = [
    "2025-10-20",
    "2025-10-21",
    "2025-10-22",
    "2025-10-23",
    "2025-10-24",
    "2025-10-25",
    "2025-10-26",
  ];

  it("returns the columns an all-day event covers", () => {
    expect(columnSpanInWeek("2025-10-23", "2025-10-25", week)).toEqual({
      startColumn: 3,
      endColumn: 5,
    });
  });

  it("clips an event that starts before or ends after the week", () => {
    expect(columnSpanInWeek("2025-10-18", "2025-10-21", week)).toEqual({
      startColumn: 0,
      endColumn: 1,
    });
    expect(columnSpanInWeek("2025-10-25", "2025-10-30", week)).toEqual({
      startColumn: 5,
      endColumn: 6,
    });
  });

  it("returns null for an event outside the week", () => {
    expect(columnSpanInWeek("2025-10-27", "2025-10-28", week)).toBeNull();
  });
});
