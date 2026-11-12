// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarIdSchema } from "@offgrid/contracts";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CalendarViewEvent } from "../../../../../../calendar-views/use-calendar-view.js";
import { SelectedDaySheet } from "./selected-day-sheet.js";

const event = (id: string): CalendarViewEvent => ({
  id: id as CalendarViewEvent["id"],
  calendarId: calendarIdSchema.parse("9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f"),
  calendarName: "Studio",
  calendarColor: "teal",
  title: `Session ${id}`,
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2025-10-23T10:00:00Z",
  endsAt: "2025-10-23T11:00:00Z",
  startDate: null,
  endDate: null,
});

describe("SelectedDaySheet", () => {
  it("shows the weekday and date with the number of events", () => {
    render(<SelectedDaySheet date="2025-10-23" events={[event("a"), event("b")]} timeZone="UTC" />);

    expect(screen.getByRole("heading", { name: "Thursday, October 23" })).toBeInTheDocument();
    expect(screen.getByText("2 Events")).toBeInTheDocument();
    expect(screen.getByText("Session a")).toBeInTheDocument();
  });

  it("says nothing is scheduled on a day with no events", () => {
    render(<SelectedDaySheet date="2025-10-23" events={[]} timeZone="UTC" />);

    expect(screen.getByText("0 Events")).toBeInTheDocument();
    expect(screen.getByText("Nothing scheduled for this day.")).toBeInTheDocument();
  });
});
