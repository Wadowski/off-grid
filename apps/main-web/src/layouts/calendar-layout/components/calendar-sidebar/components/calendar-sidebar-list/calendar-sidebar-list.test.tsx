// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NO_HIDDEN_CALENDARS } from "../../../../../../calendar-views/events-by-calendar.js";
import { CalendarSidebarList } from "./calendar-sidebar-list.js";

const STUDIO = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
});

const KITCHEN = calendarSchema.parse({
  id: "2b7d4e6f-1a2b-4c3d-8e9f-0a1b2c3d4e5f",
  name: "Kitchen",
  color: "amber",
  familyId: "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f",
  isDefault: false,
});

const renderList = (
  calendars: (typeof STUDIO)[],
  hidden: ReadonlySet<string> = NO_HIDDEN_CALENDARS,
  onToggle = vi.fn(),
) => render(<CalendarSidebarList calendars={calendars} hidden={hidden} onToggle={onToggle} />);

describe("CalendarSidebarList", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists one show checkbox per calendar, all checked by default", () => {
    renderList([STUDIO, KITCHEN]);

    const list = screen.getByTestId("sidebar-calendar-list");
    const rows = within(list).getAllByTestId("sidebar-calendar-row");
    expect(rows).toHaveLength(2);
    expect(screen.getByRole("checkbox", { name: "Studio" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Kitchen" })).toBeChecked();
  });

  it("does not navigate: no row is a link", () => {
    renderList([STUDIO]);

    expect(screen.queryByRole("link", { name: "Studio" })).not.toBeInTheDocument();
  });

  it("unchecks the calendars that are hidden", () => {
    renderList([STUDIO, KITCHEN], new Set([KITCHEN.id]));

    expect(screen.getByRole("checkbox", { name: "Studio" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Kitchen" })).not.toBeChecked();
  });

  it("reports the calendar id of the row that was ticked", () => {
    const onToggle = vi.fn();
    renderList([STUDIO, KITCHEN], NO_HIDDEN_CALENDARS, onToggle);

    screen.getByRole("checkbox", { name: "Kitchen" }).click();

    expect(onToggle).toHaveBeenCalledExactlyOnceWith(KITCHEN.id);
  });

  it("renders nothing when there are no calendars", () => {
    renderList([]);

    expect(screen.queryByTestId("sidebar-calendar-list")).not.toBeInTheDocument();
  });
});
