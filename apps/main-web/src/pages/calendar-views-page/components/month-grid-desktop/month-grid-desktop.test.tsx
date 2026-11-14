// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarIdSchema } from "@offgrid/contracts";
import { fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import type {
  CalendarViewDay,
  CalendarViewEvent,
} from "../../../../calendar-views/use-calendar-view.js";
import { MonthGridDesktop } from "./month-grid-desktop.js";

const NOVEMBER = Array.from(
  { length: 30 },
  (_, index) => `2026-11-${String(index + 1).padStart(2, "0")}`,
);

const monthDays = (events: Record<string, CalendarViewEvent[]>): CalendarViewDay[] =>
  NOVEMBER.map((date) => ({ date, events: events[date] ?? [] }));

const event = (id: string, overrides: Partial<CalendarViewEvent> = {}): CalendarViewEvent => ({
  id: id as CalendarViewEvent["id"],
  calendarId: calendarIdSchema.parse("9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f"),
  calendarName: "Studio",
  calendarColor: "teal",
  readOnly: false,
  title: id,
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2026-11-18T09:00:00Z",
  endsAt: "2026-11-18T10:00:00Z",
  startDate: null,
  endDate: null,
  ...overrides,
});

const retreat = event("retreat", {
  title: "Retreat",
  isAllDay: true,
  startsAt: "2026-11-10T00:00:00Z",
  endsAt: "2026-11-13T00:00:00Z",
  startDate: "2026-11-10",
  endDate: "2026-11-12",
});

const renderGrid = (days: CalendarViewDay[], onOpenDay = vi.fn()) =>
  render(
    <MonthGridDesktop
      days={days}
      selectedDate="2026-11-18"
      todayDate="2026-11-05"
      timeZone="UTC"
      onOpenDay={onOpenDay}
    />,
  );

describe("MonthGridDesktop", () => {
  it("renders a cell for every day of the six-row month grid", () => {
    renderGrid(monthDays({}));

    expect(screen.getAllByRole("group")).toHaveLength(42);
  });

  it("marks today and the selected day", () => {
    renderGrid(monthDays({}));

    expect(screen.getByTestId("month-desktop-day-2026-11-05")).toHaveAttribute(
      "aria-current",
      "date",
    );
    expect(screen.getByTestId("month-desktop-day-2026-11-18")).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(screen.getByTestId("month-desktop-day-2026-11-19")).toHaveAttribute(
      "data-selected",
      "false",
    );
  });

  it("draws a chip for a multi-day event on each day it spans", () => {
    renderGrid(
      monthDays({ "2026-11-10": [retreat], "2026-11-11": [retreat], "2026-11-12": [retreat] }),
    );

    for (const date of ["2026-11-10", "2026-11-11", "2026-11-12"]) {
      expect(
        within(screen.getByTestId(`month-desktop-cell-${date}`)).getByText("Retreat"),
      ).toBeInTheDocument();
    }
    expect(
      within(screen.getByTestId("month-desktop-cell-2026-11-13")).queryByText("Retreat"),
    ).toBeNull();
  });

  it("shows at most two chips and a '+N more events' control for the rest", () => {
    const busy = [event("a"), event("b"), event("c"), event("d")];
    renderGrid(monthDays({ "2026-11-18": busy }));

    const cell = screen.getByTestId("month-desktop-cell-2026-11-18");
    expect(within(cell).getAllByTestId(/^month-event-chip-/)).toHaveLength(2);
    expect(within(cell).getByRole("button", { name: "+2 more events" })).toBeInTheDocument();
  });

  it("opens the day when its number or its overflow control is clicked", () => {
    const onOpenDay = vi.fn();
    const busy = [event("a"), event("b"), event("c")];
    renderGrid(monthDays({ "2026-11-18": busy }), onOpenDay);

    fireEvent.click(screen.getByTestId("month-desktop-day-2026-11-03"));
    fireEvent.click(screen.getByRole("button", { name: "+1 more event" }));

    expect(onOpenDay).toHaveBeenNthCalledWith(1, "2026-11-03");
    expect(onOpenDay).toHaveBeenNthCalledWith(2, "2026-11-18");
  });

  it("shows day numbers and no chips for an empty month", () => {
    renderGrid(monthDays({}));

    expect(screen.getByTestId("month-desktop-day-2026-11-30")).toHaveTextContent("30");
    expect(screen.queryAllByTestId(/^month-event-chip-/)).toHaveLength(0);
  });

  it("has no serious accessibility violations", async () => {
    const { container } = renderGrid(monthDays({ "2026-11-10": [retreat] }));

    const result = await axe.run(container);
    expect(
      result.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([]);
  });
});
