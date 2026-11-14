// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventIdSchema, calendarIdSchema } from "@offgrid/contracts";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CalendarViewEvent } from "../../../../../../calendar-views/use-calendar-view.js";
import { TimelineEventBlock } from "./timeline-event-block.js";

const event = (overrides: Partial<CalendarViewEvent> = {}): CalendarViewEvent => ({
  id: calendarEventIdSchema.parse("5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f"),
  calendarId: calendarIdSchema.parse("9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f"),
  calendarName: "Work",
  calendarColor: "blue",
  readOnly: false,
  title: "Standup",
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2025-10-23T09:00:00Z",
  endsAt: "2025-10-23T09:30:00Z",
  startDate: null,
  endDate: null,
  ...overrides,
});

const renderBlock = (overrides: Partial<CalendarViewEvent> = {}) =>
  render(
    <TimelineEventBlock
      event={event(overrides)}
      timeZone="UTC"
      topPx={100}
      heightPx={64}
      column={0}
      columnCount={1}
    />,
  );

describe("TimelineEventBlock", () => {
  it("shows the title, the time range and the duration", () => {
    renderBlock();

    const block = screen.getByTestId("timeline-event-5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f");
    expect(block).toHaveTextContent("Standup");
    expect(block).toHaveTextContent("09:00 AM - 09:30 AM");
    expect(block).toHaveTextContent("30");
  });

  it("shows the location when the event has one", () => {
    renderBlock({ location: "Kitchen" });

    expect(
      screen.getByTestId("timeline-event-5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f"),
    ).toHaveTextContent("Kitchen");
  });

  it("shows no location line when the event has none", () => {
    renderBlock({ location: null });

    expect(
      screen.getByTestId("timeline-event-5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f"),
    ).not.toHaveTextContent("Kitchen");
  });
});
