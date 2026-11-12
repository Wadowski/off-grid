// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarIdSchema } from "@offgrid/contracts";
import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import type { CalendarViewEvent } from "../../../../calendar-views/use-calendar-view.js";
import { AgendaList } from "./agenda-list.js";

const event = (
  overrides: Partial<Omit<CalendarViewEvent, "id">> & { readonly id: string },
): CalendarViewEvent => ({
  calendarId: calendarIdSchema.parse("9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f"),
  calendarName: "Studio",
  calendarColor: "teal",
  title: "Event",
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2025-10-23T08:30:00Z",
  endsAt: "2025-10-23T09:15:00Z",
  startDate: null,
  endDate: null,
  ...overrides,
  id: overrides.id as CalendarViewEvent["id"],
});

describe("AgendaList", () => {
  it("says nothing is scheduled for an empty day", () => {
    render(<AgendaList events={[]} timeZone="UTC" />);

    expect(screen.getByText("Nothing scheduled for this day.")).toBeInTheDocument();
  });

  it("lists all-day events first and then timed events in time order", () => {
    render(
      <AgendaList
        events={[
          event({
            id: "late",
            title: "Late",
            startsAt: "2025-10-23T13:00:00Z",
            endsAt: "2025-10-23T14:00:00Z",
          }),
          event({
            id: "allday",
            title: "Trip",
            isAllDay: true,
            startsAt: "2025-10-23T00:00:00Z",
            endsAt: "2025-10-24T00:00:00Z",
          }),
          event({
            id: "early",
            title: "Early",
            startsAt: "2025-10-23T08:30:00Z",
            endsAt: "2025-10-23T09:15:00Z",
          }),
        ]}
        timeZone="UTC"
      />,
    );

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.getAttribute("data-testid"))).toEqual([
      "agenda-event-allday",
      "agenda-event-early",
      "agenda-event-late",
    ]);
    expect(screen.getByText("All day")).toBeInTheDocument();
  });

  it("shows the start time, the duration and the end time of a timed event", () => {
    render(
      <AgendaList
        events={[event({ id: "a", title: "Dropoff", location: "West Gate" })]}
        timeZone="UTC"
      />,
    );

    const card = screen.getByTestId("agenda-event-a");
    expect(within(card).getByText("08:30")).toBeInTheDocument();
    expect(within(card).getByText("AM")).toBeInTheDocument();
    expect(within(card).getByText("45m")).toBeInTheDocument();
    expect(within(card).getByText("West Gate")).toBeInTheDocument();
    expect(within(card).getByText("09:15 AM End")).toBeInTheDocument();
  });

  it("shows the time in the caller's zone", () => {
    render(<AgendaList events={[event({ id: "a", title: "Dropoff" })]} timeZone="Europe/Warsaw" />);

    expect(within(screen.getByTestId("agenda-event-a")).getByText("10:30")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <AgendaList
        events={[event({ id: "a", title: "Dropoff", location: "West Gate" })]}
        timeZone="UTC"
      />,
    );

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  }, 30_000);
});
