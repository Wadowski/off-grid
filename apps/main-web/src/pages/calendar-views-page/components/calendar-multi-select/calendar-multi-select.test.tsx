// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NO_HIDDEN_CALENDARS } from "../../../../calendar-views/events-by-calendar.js";
import type { Calendar } from "../../../../calendars/types.js";
import { CalendarMultiSelect } from "./calendar-multi-select.js";

const STUDIO: Calendar = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: true,
});
const HOME: Calendar = calendarSchema.parse({
  id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  name: "Home",
  color: "rose",
  familyId: null,
  isDefault: false,
});

describe("CalendarMultiSelect", () => {
  it("shows all calendars as the summary until one is unticked", () => {
    render(
      <CalendarMultiSelect
        calendars={[STUDIO, HOME]}
        hidden={NO_HIDDEN_CALENDARS}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Calendar filter: All Calendars" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens a checkbox group with every calendar ticked", () => {
    render(
      <CalendarMultiSelect
        calendars={[STUDIO, HOME]}
        hidden={NO_HIDDEN_CALENDARS}
        onChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^Calendar filter/ }));

    const group = screen.getByRole("group", { name: "Calendar filter" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Studio" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Home" })).toBeChecked();
  });

  it("reports the calendar that is unticked as hidden", () => {
    const onChange = vi.fn();
    render(
      <CalendarMultiSelect
        calendars={[STUDIO, HOME]}
        hidden={NO_HIDDEN_CALENDARS}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Calendar filter/ }));

    fireEvent.click(screen.getByRole("checkbox", { name: "Home" }));

    expect([...(onChange.mock.calls[0]?.[0] ?? [])]).toEqual([HOME.id]);
  });

  it("summarises the selection as the count of ticked calendars", () => {
    render(
      <CalendarMultiSelect
        calendars={[STUDIO, HOME]}
        hidden={new Set([HOME.id])}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Calendar filter: 1 of 2 calendars" }),
    ).toBeInTheDocument();
  });

  it("closes the panel with the Escape key", () => {
    render(
      <CalendarMultiSelect calendars={[STUDIO]} hidden={NO_HIDDEN_CALENDARS} onChange={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Calendar filter/ }));

    fireEvent.keyDown(screen.getByRole("group", { name: "Calendar filter" }), { key: "Escape" });

    expect(screen.queryByRole("group", { name: "Calendar filter" })).not.toBeInTheDocument();
  });
});
