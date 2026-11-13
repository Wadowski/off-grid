// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  daysBetween,
  isoWeekNumber,
  localDateOf,
  mondayOf,
  weekDates,
} from "./week-days.js";

describe("week days", () => {
  it("finds the Monday of the ISO week for any weekday", () => {
    expect(mondayOf("2025-10-23")).toBe("2025-10-20");
    expect(mondayOf("2025-10-20")).toBe("2025-10-20");
    expect(mondayOf("2025-10-26")).toBe("2025-10-20");
  });

  it("returns seven days from Monday to Sunday", () => {
    expect(weekDates("2025-10-20")).toEqual([
      "2025-10-20",
      "2025-10-21",
      "2025-10-22",
      "2025-10-23",
      "2025-10-24",
      "2025-10-25",
      "2025-10-26",
    ]);
  });

  it("crosses month and year boundaries when adding days", () => {
    expect(addDays("2025-12-30", 3)).toBe("2026-01-02");
    expect(addDays("2025-03-01", -1)).toBe("2025-02-28");
  });

  it("keeps the day of month when adding months and clamps to the month end", () => {
    expect(addMonths("2025-10-23", 1)).toBe("2025-11-23");
    expect(addMonths("2025-01-31", 1)).toBe("2025-02-28");
    expect(addMonths("2025-10-23", -1)).toBe("2025-09-23");
  });

  it("counts whole days across the spring-forward change without an hour shift", () => {
    expect(daysBetween("2025-03-29", "2025-03-31")).toBe(2);
  });

  it("builds the local calendar date of a Date in the browser zone", () => {
    expect(localDateOf(new Date(2025, 9, 23, 23, 59))).toBe("2025-10-23");
  });

  it("numbers the weeks by ISO 8601, where a week belongs to the year of its Thursday", () => {
    expect(isoWeekNumber("2026-11-16")).toBe(47);
    expect(isoWeekNumber("2024-12-30")).toBe(1);
    expect(isoWeekNumber("2026-01-05")).toBe(2);
    expect(isoWeekNumber("2026-12-28")).toBe(53);
  });
});
