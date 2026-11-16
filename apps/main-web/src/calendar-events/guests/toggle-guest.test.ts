// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { EventFormValues } from "../types.js";
import { toggleGuest } from "./toggle-guest.js";

const values: EventFormValues = {
  title: "Review",
  calendarId: "calendar-1",
  isAllDay: false,
  startDate: "2026-11-20",
  startTime: "10:00",
  endDate: "2026-11-20",
  endTime: "11:00",
  location: "",
  description: "",
  reminderOffsetsMinutes: [],
  guestUserIds: ["ben"],
};

describe("toggleGuest", () => {
  it("adds a guest who is not selected yet", () => {
    expect(toggleGuest(values, "cara").guestUserIds).toEqual(["ben", "cara"]);
  });

  it("removes a guest who is already selected", () => {
    expect(toggleGuest(values, "ben").guestUserIds).toEqual([]);
  });

  it("leaves the other fields unchanged", () => {
    expect(toggleGuest(values, "cara").title).toBe("Review");
  });
});
