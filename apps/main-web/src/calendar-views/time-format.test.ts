// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import {
  durationMinutes,
  formatClockTime,
  formatDayHeading,
  formatGmtOffset,
  formatHourLabel,
  zonedMomentOf,
} from "./time-format.js";

describe("time format", () => {
  it("shows a clock time in the caller's zone", () => {
    expect(formatClockTime("2025-10-23T15:30:00Z", "Europe/Warsaw")).toBe("05:30 PM");
    expect(formatClockTime("2025-10-23T15:30:00Z", "UTC")).toBe("03:30 PM");
  });

  it("finds the local date and minute of an instant in a zone", () => {
    expect(zonedMomentOf("2025-10-23T23:30:00Z", "Europe/Warsaw")).toEqual({
      date: "2025-10-24",
      minutesOfDay: 90,
    });
  });

  it("labels hours on the 12-hour clock", () => {
    expect(formatHourLabel(0)).toBe("12:00 AM");
    expect(formatHourLabel(13)).toBe("01:00 PM");
  });

  it("measures a duration in whole minutes", () => {
    expect(durationMinutes("2025-10-23T08:30:00Z", "2025-10-23T09:15:00Z")).toBe(45);
  });

  it("writes the day heading with weekday, month and day", () => {
    expect(formatDayHeading("2025-10-23")).toBe("Thursday, October 23");
  });

  it("writes the GMT offset of the zone for a date", () => {
    expect(formatGmtOffset("2025-10-23", "America/Los_Angeles")).toBe("-7");
    expect(formatGmtOffset("2025-10-23", "Asia/Kolkata")).toBe("+5:30");
    expect(formatGmtOffset("2025-10-23", "UTC")).toBe("+0");
  });
});
