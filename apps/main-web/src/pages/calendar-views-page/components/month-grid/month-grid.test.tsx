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
import { MonthGrid } from "./month-grid.js";

const octoberDays = (events: Record<string, CalendarViewEvent[]>): CalendarViewDay[] =>
  Array.from({ length: 31 }, (_, index) => {
    const date = `2025-10-${String(index + 1).padStart(2, "0")}`;
    return { date, events: events[date] ?? [] };
  });

const event = (
  id: string,
  calendarColor: CalendarViewEvent["calendarColor"],
): CalendarViewEvent => ({
  id: id as CalendarViewEvent["id"],
  calendarId: calendarIdSchema.parse("9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f"),
  calendarName: "Studio",
  calendarColor,
  readOnly: false,
  title: "Session",
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2025-10-23T10:00:00Z",
  endsAt: "2025-10-23T11:00:00Z",
  startDate: null,
  endDate: null,
});

const renderGrid = (days: CalendarViewDay[], onSelect = vi.fn()) =>
  render(
    <MonthGrid
      days={days}
      selectedDate="2025-10-23"
      todayDate="2025-10-23"
      timeZone="UTC"
      selectedEvents={[]}
      onSelect={onSelect}
    />,
  );

describe("MonthGrid", () => {
  it("shows Monday-first weeks with the days of the month", () => {
    renderGrid(octoberDays({}));

    const grid = screen.getByRole("group", { name: "Month days" });
    expect(within(grid).getByTestId("month-day-2025-10-01")).toHaveTextContent("1");
    expect(within(grid).getByTestId("month-day-2025-10-31")).toHaveTextContent("31");
  });

  it("dims the days before and after the month without making them buttons", () => {
    renderGrid(octoberDays({}));

    expect(screen.queryByTestId("month-day-2025-09-29")).not.toBeInTheDocument();
    expect(screen.getByTestId("month-day-2025-10-29")).toBeInTheDocument();
    expect(screen.getAllByText("29", { selector: "span" })).toHaveLength(2);
  });

  it("shows at most three dots, one per distinct calendar colour", () => {
    renderGrid(
      octoberDays({
        "2025-10-06": [
          event("a", "blue"),
          event("b", "teal"),
          event("c", "green"),
          event("d", "amber"),
          event("e", "blue"),
        ],
      }),
    );

    const dots = screen
      .getByTestId("month-day-2025-10-06")
      .querySelectorAll('[data-testid="month-day-dot"]');
    expect(dots).toHaveLength(3);
  });

  it("marks the selected day as pressed and reports the day that is picked", () => {
    const onSelect = vi.fn();
    renderGrid(octoberDays({}), onSelect);

    expect(screen.getByTestId("month-day-2025-10-23")).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByTestId("month-day-2025-10-12"));

    expect(onSelect).toHaveBeenCalledWith("2025-10-12");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <MonthGrid
        days={octoberDays({})}
        selectedDate="2025-10-23"
        todayDate="2025-10-23"
        timeZone="UTC"
        selectedEvents={[]}
        onSelect={vi.fn()}
      />,
    );

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  }, 30_000);
});
