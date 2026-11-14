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
    expect(columns).toHaveLength(7);
    const columnAt = (index: number): HTMLElement => {
      const column = columns[index];
      if (column === undefined) {
        throw new Error(`week day column ${index} is missing`);
      }
      return column;
    };
    expect(within(columnAt(1)).getByTestId("week-event-conf")).toBeInTheDocument();
    expect(within(columnAt(2)).getByTestId("week-event-conf")).toBeInTheDocument();
    expect(within(columnAt(3)).getByTestId("week-event-conf")).toBeInTheDocument();
    expect(columnAt(0).querySelector('[data-testid="week-event-conf"]')).toBeNull();
    expect(columnAt(4).querySelector('[data-testid="week-event-conf"]')).toBeNull();
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
  it("shows the bold title, the time range and the location chip on a desktop event card", () => {
    render(
      <WeekGrid
        days={weekWith({
          "2025-10-23": [
            event("studio", {
              title: "Studio session",
              startsAt: "2025-10-23T10:00:00Z",
              endsAt: "2025-10-23T11:15:00Z",
              location: "Hayes Valley",
            }),
          ],
        })}
        selectedDate="2025-10-23"
        todayDate="2025-10-20"
        timeZone="UTC"
        now={NOON_WED}
        size={DESKTOP_WEEK_SIZE}
      />,
    );

    const card = screen.getByTestId("week-event-studio");
    expect(within(card).getByText("Studio session")).toBeInTheDocument();
    expect(within(card).getByText("10:00 \u2013 11:15")).toBeInTheDocument();
    expect(within(card).getByTestId("week-event-location")).toHaveTextContent("Hayes Valley");
  });

  it("hides the location chip on a desktop event card when the event has no location", () => {
    render(
      <WeekGrid
        days={weekWith({ "2025-10-23": [event("plain", { location: null })] })}
        selectedDate="2025-10-23"
        todayDate="2025-10-20"
        timeZone="UTC"
        now={NOON_WED}
        size={DESKTOP_WEEK_SIZE}
      />,
    );

    const card = screen.getByTestId("week-event-plain");
    expect(within(card).getByText("10:00 \u2013 11:00")).toBeInTheDocument();
    expect(within(card).queryByTestId("week-event-location")).toBeNull();
  });

  it("keeps the phone event card to the title and start time, without a location chip", () => {
    render(
      <WeekGrid
        days={weekWith({
          "2025-10-23": [event("phone", { location: "Hayes Valley" })],
        })}
        selectedDate="2025-10-23"
        todayDate="2025-10-20"
        timeZone="UTC"
        now={NOON_WED}
      />,
    );

    const card = screen.getByTestId("week-event-phone");
    expect(within(card).queryByTestId("week-event-location")).toBeNull();
    expect(within(card).queryByText("10:00 \u2013 11:00")).toBeNull();
    expect(within(card).getByText("Studio session")).toBeInTheDocument();
    expect(within(card).getByText("10:00 AM")).toBeInTheDocument();
  });

  it("shows the title and the full time range of a 30-minute desktop event inside its card", () => {
    render(
      <WeekGrid
        days={weekWith({
          "2025-10-23": [
            event("short", {
              title: "Standup",
              startsAt: "2025-10-23T09:00:00Z",
              endsAt: "2025-10-23T09:30:00Z",
            }),
          ],
        })}
        selectedDate="2025-10-23"
        todayDate="2025-10-20"
        timeZone="UTC"
        now={NOON_WED}
        size={DESKTOP_WEEK_SIZE}
      />,
    );

    const card = screen.getByTestId("week-event-short");
    expect(card).toHaveStyle({ height: "34px" });
    const title = within(card).getByText("Standup");
    const range = within(card).getByText("09:00 \u2013 09:30");
    expect(title.parentElement).toBe(card);
    expect(range.parentElement).toBe(card);
    expect(within(card).queryByTestId("week-event-location")).toBeNull();
  });
});
