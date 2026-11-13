// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { CalendarRecord } from "../../types.js";
import { guestCalendarFields } from "./guest-calendar-fields.js";

const calendar: CalendarRecord = {
  calendarId: "calendar-1",
  name: "Work",
  color: "violet",
  familyId: null,
  userId: "host-1",
  isDefault: false,
};

describe("guestCalendarFields", () => {
  it("returns the name and colour of a visible calendar", () => {
    expect(guestCalendarFields(calendar)).toEqual({
      calendarName: "Work",
      calendarColor: "violet",
    });
  });

  it("returns no name or colour when the calendar is not visible", () => {
    expect(guestCalendarFields(null)).toEqual({});
  });
});
