// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarIdSchema } from "@offgrid/contracts";
import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import type {
  CalendarViewDay,
  CalendarViewEvent,
} from "../../../../calendar-views/use-calendar-view.js";
import { DESKTOP_WEEK_SIZE } from "./constants.js";
import { WeekGrid } from "./week-grid.js";

const WEEK = [
  "2025-10-20",
  "2025-10-21",
  "2025-10-22",
  "2025-10-23",
  "2025-10-24",
  "2025-10-25",
  "2025-10-26",
];

const event = (
  id: string,
  overrides: Partial<Omit<CalendarViewEvent, "id">> = {},
): CalendarViewEvent => ({
  id: id as CalendarViewEvent["id"],
  calendarId: calendarIdSchema.parse("9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f"),
  calendarName: "Studio",
  calendarColor: "teal",
  readOnly: false,
  title: "Studio session",
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2025-10-23T10:00:00Z",
  endsAt: "2025-10-23T11:00:00Z",
  startDate: null,
  endDate: null,
  ...overrides,
});

const weekWith = (events: Record<string, CalendarViewEvent[]>): CalendarViewDay[] =>
  WEEK.map((date) => ({ date, events: events[date] ?? [] }));

const NOON_WED = new Date("2025-10-23T12:00:00Z");

describe("WeekGrid", () => {
  it("shows seven day columns from Monday to Sunday", () => {
    render(
      <WeekGrid
        days={weekWith({})}
        selectedDate="2025-10-23"
        todayDate="2025-10-23"
        timeZone="UTC"
        now={NOON_WED}
      />,
    );

    expect(screen.getAllByTestId("week-day-column")).toHaveLength(7);
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("places an event in its day column at its time", () => {
    render(
      <WeekGrid
        days={weekWith({ "2025-10-23": [event("a")] })}
        selectedDate="2025-10-23"
        todayDate="2025-10-20"
        timeZone="UTC"
        now={new Date("2025-10-20T09:00:00Z")}
      />,
    );

    const block = screen.getByTestId("week-event-a");
    expect(block).toHaveStyle({ top: "120px" });
    expect(block).toHaveTextContent("Studio session");
    expect(
      within(screen.getAllByTestId("week-day-column")[3] ?? document.body).getByTestId(
        "week-event-a",
      ),
    ).toBeInTheDocument();
  });

  it("shows the now line only in the column of today", () => {
    render(
      <WeekGrid
        days={weekWith({})}
        selectedDate="2025-10-23"
        todayDate="2025-10-23"
        timeZone="UTC"
        now={NOON_WED}
      />,
    );

    expect(screen.getAllByTestId("week-now")).toHaveLength(1);
  });

  it("shows the GMT offset of the zone for the week", () => {
    render(
      <WeekGrid
        days={weekWith({})}
        selectedDate="2025-10-23"
        todayDate="2025-10-23"
        timeZone="America/Los_Angeles"
        now={NOON_WED}
      />,
    );

    expect(screen.getByText("GMT-7")).toBeInTheDocument();
  });

  it("shows an all-day event as a bar", () => {
    render(
      <WeekGrid
        days={weekWith({
          "2025-10-23": [
            event("trip", {
              title: "Cabin Trip",
              isAllDay: true,
              startDate: "2025-10-23",
              endDate: "2025-10-25",
            }),
          ],
        })}
        selectedDate="2025-10-23"
        todayDate="2025-10-23"
        timeZone="UTC"
        now={NOON_WED}
      />,
    );

    expect(screen.getByText("Cabin Trip")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <WeekGrid
        days={weekWith({ "2025-10-23": [event("a")] })}
        selectedDate="2025-10-23"
        todayDate="2025-10-23"
        timeZone="UTC"
        now={NOON_WED}
      />,
    );

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  }, 30_000);

  it("shows a multi-day timed event in every day column it spans and in no other", () => {
    const conference = event("conf", {
      title: "Conference",
      startsAt: "2025-10-21T09:00:00Z",
      endsAt: "2025-10-23T17:00:00Z",
    });
    render(
      <WeekGrid
        days={weekWith({
          "2025-10-21": [conference],
          "2025-10-22": [conference],
          "2025-10-23": [conference],
        })}
        selectedDate="2025-10-22"
        todayDate="2025-10-23"
        timeZone="UTC"
        now={NOON_WED}
      />,
    );

    const columns = screen.getAllByTestId("week-day-column");
    expect(within(columns[1] ?? document.body).getByTestId("week-event-conf")).toBeInTheDocument();
    expect(within(columns[2] ?? document.body).getByTestId("week-event-conf")).toBeInTheDocument();
    expect(within(columns[3] ?? document.body).getByTestId("week-event-conf")).toBeInTheDocument();
    expect(columns[0]?.querySelector('[data-testid="week-event-conf"]')).toBeNull();
    expect(columns[4]?.querySelector('[data-testid="week-event-conf"]')).toBeNull();
  });

  it("shows a multi-day all-day event once as one bar", () => {
    render(
      <WeekGrid
        days={weekWith({
          "2025-10-21": [
            event("trip", {
              title: "Cabin Trip",
              isAllDay: true,
              startDate: "2025-10-21",
              endDate: "2025-10-23",
            }),
          ],
          "2025-10-22": [
            event("trip", {
              title: "Cabin Trip",
              isAllDay: true,
              startDate: "2025-10-21",
              endDate: "2025-10-23",
            }),
          ],
          "2025-10-23": [
            event("trip", {
              title: "Cabin Trip",
              isAllDay: true,
              startDate: "2025-10-21",
              endDate: "2025-10-23",
            }),
          ],
        })}
        selectedDate="2025-10-22"
        todayDate="2025-10-23"
        timeZone="UTC"
        now={NOON_WED}
      />,
    );

    expect(screen.getAllByText("Cabin Trip")).toHaveLength(1);
  });

  it("uses the desktop hour height for the block position and length", () => {
    render(
      <WeekGrid
        days={weekWith({ "2025-10-23": [event("a")] })}
        selectedDate="2025-10-23"
        todayDate="2025-10-20"
        timeZone="UTC"
        now={NOON_WED}
        size={DESKTOP_WEEK_SIZE}
      />,
    );

    expect(screen.getByTestId("week-event-a")).toHaveStyle({ top: "136px", height: "68px" });
  });
});
