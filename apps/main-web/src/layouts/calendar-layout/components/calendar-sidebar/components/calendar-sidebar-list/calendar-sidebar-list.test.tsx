// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
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

const dotOf = (row: HTMLElement): HTMLElement => {
  const dot = row.querySelector<HTMLElement>("span[aria-hidden='true']");
  if (dot === null) {
    throw new Error("Calendar row has no color dot.");
  }
  return dot;
};

const renderList = (calendars: (typeof STUDIO)[], path = "/calendar") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CalendarSidebarList calendars={calendars} />
    </MemoryRouter>,
  );

describe("CalendarSidebarList", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists each calendar with its color dot and a link to its edit screen", () => {
    renderList([STUDIO, KITCHEN]);

    const list = screen.getByTestId("sidebar-calendar-list");
    const rows = within(list).getAllByTestId("sidebar-calendar-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("href", `/calendar/${STUDIO.id}`);
    expect(within(rows[0]!).getByText("Studio")).toBeInTheDocument();
    expect(dotOf(rows[0]!).style.background).toBe("rgb(15, 148, 136)");
    expect(dotOf(rows[1]!).style.background).toBe("rgb(211, 138, 14)");
  });

  it("marks the row of the open calendar as the current page", () => {
    renderList([STUDIO, KITCHEN], `/calendar/${KITCHEN.id}`);

    const rows = screen.getAllByTestId("sidebar-calendar-row");
    expect(rows[0]).not.toHaveAttribute("aria-current");
    expect(rows[1]).toHaveAttribute("aria-current", "page");
  });

  it("renders nothing when there are no calendars", () => {
    renderList([]);

    expect(screen.queryByTestId("sidebar-calendar-list")).not.toBeInTheDocument();
  });
});
