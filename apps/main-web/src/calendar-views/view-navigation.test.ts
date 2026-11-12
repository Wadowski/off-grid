// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import {
  DEFAULT_CALENDAR_VIEW,
  isCalendarViewKind,
  periodLabel,
  requestDateFor,
  shiftDate,
} from "./view-navigation.js";

describe("view navigation", () => {
  it("opens the agenda when no view is named", () => {
    expect(DEFAULT_CALENDAR_VIEW).toBe("agenda");
  });

  it("accepts only the four view names", () => {
    expect(isCalendarViewKind("week")).toBe(true);
    expect(isCalendarViewKind("year")).toBe(false);
    expect(isCalendarViewKind(undefined)).toBe(false);
  });

  it("moves agenda and week by one week, day by one day and month by one month", () => {
    expect(shiftDate("2025-10-23", "agenda", 1)).toBe("2025-10-30");
    expect(shiftDate("2025-10-23", "week", -1)).toBe("2025-10-16");
    expect(shiftDate("2025-10-23", "day", 1)).toBe("2025-10-24");
    expect(shiftDate("2025-10-23", "month", 1)).toBe("2025-11-23");
  });

  it("requests the Monday of the week for the agenda and the date itself for the other views", () => {
    expect(requestDateFor("agenda", "2025-10-23")).toBe("2025-10-20");
    expect(requestDateFor("day", "2025-10-23")).toBe("2025-10-23");
    expect(requestDateFor("week", "2025-10-23")).toBe("2025-10-23");
    expect(requestDateFor("month", "2025-10-23")).toBe("2025-10-23");
  });

  it("labels the week as a Monday to Sunday range", () => {
    expect(periodLabel("week", "2025-10-23")).toBe("Oct 20 - 26");
    expect(periodLabel("week", "2025-10-29")).toBe("Oct 27 - Nov 2");
  });

  it("labels agenda, day and month with the month and year", () => {
    expect(periodLabel("agenda", "2025-10-23")).toBe("October 2025");
    expect(periodLabel("day", "2025-10-23")).toBe("October 2025");
    expect(periodLabel("month", "2025-10-23")).toBe("October 2025");
  });
});
