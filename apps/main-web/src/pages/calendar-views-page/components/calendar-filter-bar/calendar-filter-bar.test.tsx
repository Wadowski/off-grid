// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { ALL_CALENDARS } from "../../../../calendar-views/events-by-calendar.js";
import type { Calendar } from "../../../../calendars/types.js";
import { CalendarFilterBar } from "./calendar-filter-bar.js";

const STUDIO: Calendar = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: true,
});
const KITCHEN: Calendar = calendarSchema.parse({
  id: "2b7d4e6f-1a2b-4c3d-8e9f-0a1b2c3d4e5f",
  name: "Kitchen",
  color: "amber",
  familyId: null,
  isDefault: false,
});

describe("CalendarFilterBar", () => {
  it("lists all calendars and then each calendar by name", () => {
    render(
      <CalendarFilterBar
        calendars={[STUDIO, KITCHEN]}
        selected={ALL_CALENDARS}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "All Calendars" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Studio" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Kitchen" })).toBeInTheDocument();
  });

  it("reports the calendar the person picks", () => {
    const onSelect = vi.fn();
    render(
      <CalendarFilterBar
        calendars={[STUDIO, KITCHEN]}
        selected={ALL_CALENDARS}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Kitchen" }));

    expect(onSelect).toHaveBeenCalledWith(KITCHEN.id);
  });

  it("reports the all-calendars choice again", () => {
    const onSelect = vi.fn();
    render(<CalendarFilterBar calendars={[STUDIO]} selected={STUDIO.id} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "All Calendars" }));

    expect(onSelect).toHaveBeenCalledWith(ALL_CALENDARS);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <CalendarFilterBar calendars={[STUDIO]} selected={ALL_CALENDARS} onSelect={vi.fn()} />,
    );

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  }, 30_000);
});
