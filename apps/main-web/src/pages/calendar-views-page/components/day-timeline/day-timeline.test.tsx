// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarIdSchema } from "@offgrid/contracts";
import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import type { CalendarViewEvent } from "../../../../calendar-views/use-calendar-view.js";
import { DayTimeline } from "./day-timeline.js";

const event = (
  id: string,
  overrides: Partial<Omit<CalendarViewEvent, "id">> = {},
): CalendarViewEvent => ({
  id: id as CalendarViewEvent["id"],
  calendarId: calendarIdSchema.parse("9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f"),
  calendarName: "Studio",
  calendarColor: "teal",
  readOnly: false,
  title: "Dropoff",
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2025-10-23T08:30:00Z",
  endsAt: "2025-10-23T09:15:00Z",
  startDate: null,
  endDate: null,
  ...overrides,
});

const NOON_ON_THE_DAY = new Date("2025-10-23T12:00:00Z");
const NOON_ANOTHER_DAY = new Date("2025-10-25T12:00:00Z");

describe("DayTimeline", () => {
  it("shows an hour row for every hour of the day", () => {
    render(<DayTimeline events={[]} date="2025-10-23" timeZone="UTC" now={NOON_ANOTHER_DAY} />);

    const timeline = screen.getByTestId("day-timeline");
    expect(within(timeline).getByText("00:00")).toBeInTheDocument();
    expect(within(timeline).getByText("23:00")).toBeInTheDocument();
  });

  it("places an event by its start time and length in the caller's zone", () => {
    render(
      <DayTimeline events={[event("a")]} date="2025-10-23" timeZone="UTC" now={NOON_ANOTHER_DAY} />,
    );

    const block = screen.getByTestId("timeline-event-a");
    expect(block).toHaveStyle({ top: "760px" });
    expect(block).toHaveTextContent("Dropoff");
    expect(block).toHaveTextContent("08:30 AM - 09:15 AM");
  });

  it("shows the now line only when the selected day is today", () => {
    const { unmount } = render(
      <DayTimeline events={[]} date="2025-10-23" timeZone="UTC" now={NOON_ON_THE_DAY} />,
    );
    expect(screen.getByTestId("timeline-now")).toHaveTextContent("12:00 PM");
    unmount();

    render(<DayTimeline events={[]} date="2025-10-23" timeZone="UTC" now={NOON_ANOTHER_DAY} />);
    expect(screen.queryByTestId("timeline-now")).not.toBeInTheDocument();
  });

  it("puts overlapping events side by side", () => {
    render(
      <DayTimeline
        events={[
          event("a"),
          event("b", { startsAt: "2025-10-23T08:45:00Z", endsAt: "2025-10-23T09:30:00Z" }),
        ]}
        date="2025-10-23"
        timeZone="UTC"
        now={NOON_ANOTHER_DAY}
      />,
    );

    const first = screen.getByTestId("timeline-event-a");
    const second = screen.getByTestId("timeline-event-b");
    expect(first.style.width).toBe(second.style.width);
    expect(first.style.left).not.toBe(second.style.left);
  });

  it("lists all-day events above the hours", () => {
    render(
      <DayTimeline
        events={[event("trip", { title: "Cabin Trip", isAllDay: true })]}
        date="2025-10-23"
        timeZone="UTC"
        now={NOON_ANOTHER_DAY}
      />,
    );

    expect(screen.getByText("Cabin Trip")).toBeInTheDocument();
  });

  it("makes the scrolling hours a named region that keyboard users can reach", () => {
    render(<DayTimeline events={[]} date="2025-10-23" timeZone="UTC" now={NOON_ANOTHER_DAY} />);

    const region = screen.getByRole("region", { name: "Hours" });
    expect(region).toBe(screen.getByTestId("day-timeline"));
    expect(region).toHaveAttribute("tabindex", "0");
  });

  it("says nothing is scheduled when the day has no events", () => {
    render(<DayTimeline events={[]} date="2025-10-23" timeZone="UTC" now={NOON_ANOTHER_DAY} />);

    expect(screen.getByText("Nothing scheduled for this day.")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <DayTimeline events={[event("a")]} date="2025-10-23" timeZone="UTC" now={NOON_ANOTHER_DAY} />,
    );

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  }, 30_000);
});
