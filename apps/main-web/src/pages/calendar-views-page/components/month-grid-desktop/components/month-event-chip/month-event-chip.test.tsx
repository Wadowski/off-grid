// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarIdSchema } from "@offgrid/contracts";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import type { CalendarViewEvent } from "../../../../../../calendar-views/use-calendar-view.js";
import { MonthEventChip } from "./month-event-chip.js";

const event = (overrides: Partial<CalendarViewEvent> = {}): CalendarViewEvent => ({
  id: "standup" as CalendarViewEvent["id"],
  calendarId: calendarIdSchema.parse("9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f"),
  calendarName: "Studio",
  calendarColor: "teal",
  readOnly: false,
  title: "Standup",
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2026-11-18T09:30:00Z",
  endsAt: "2026-11-18T10:00:00Z",
  startDate: null,
  endDate: null,
  ...overrides,
});

describe("MonthEventChip", () => {
  it("is named by its title and the start time and is not a tab stop", () => {
    render(<MonthEventChip event={event()} timeZone="UTC" />);

    const chip = screen.getByRole("img", { name: "Standup, 09:30 AM" });
    expect(chip).toHaveTextContent("Standup");
    expect(chip).not.toHaveAttribute("tabindex");
  });

  it("names an all-day event by its title and the all-day label", () => {
    render(
      <MonthEventChip
        event={event({
          isAllDay: true,
          title: "Retreat",
          startDate: "2026-11-10",
          endDate: "2026-11-12",
        })}
        timeZone="UTC"
      />,
    );

    expect(screen.getByRole("img", { name: "Retreat, All day" })).toBeInTheDocument();
  });

  it("has no serious accessibility violations", async () => {
    const { container } = render(<MonthEventChip event={event()} timeZone="UTC" />);

    const result = await axe.run(container);
    expect(
      result.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([]);
  });
});
