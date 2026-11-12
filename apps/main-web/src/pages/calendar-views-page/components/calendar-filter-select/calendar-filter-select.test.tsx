// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ALL_CALENDARS } from "../../../../calendar-views/events-by-calendar.js";
import type { Calendar } from "../../../../calendars/types.js";
import { CalendarFilterSelect } from "./calendar-filter-select.js";

const STUDIO: Calendar = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: true,
});

describe("CalendarFilterSelect", () => {
  it("lists all calendars and each calendar by name", () => {
    render(
      <CalendarFilterSelect calendars={[STUDIO]} selected={ALL_CALENDARS} onSelect={vi.fn()} />,
    );

    const select = screen.getByRole("combobox", { name: "Calendar filter" });
    expect(select).toHaveValue(ALL_CALENDARS);
    expect(screen.getByRole("option", { name: "Studio" })).toBeInTheDocument();
  });

  it("reports the calendar the person picks", () => {
    const onSelect = vi.fn();
    render(
      <CalendarFilterSelect calendars={[STUDIO]} selected={ALL_CALENDARS} onSelect={onSelect} />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Calendar filter" }), {
      target: { value: STUDIO.id },
    });

    expect(onSelect).toHaveBeenCalledWith(STUDIO.id);
  });
});
