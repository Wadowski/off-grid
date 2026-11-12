// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { CalendarSidebar } from "./calendar-sidebar.js";

const STUDIO = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
});

describe("CalendarSidebar", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the Calendars heading and the calendar list as a named complementary region", () => {
    render(
      <MemoryRouter>
        <CalendarSidebar calendars={[STUDIO]} />
      </MemoryRouter>,
    );

    const sidebar = screen.getByRole("complementary", { name: "Calendars" });
    expect(within(sidebar).getByText("Calendars")).toBeInTheDocument();
    expect(within(sidebar).getByTestId("sidebar-calendar-row")).toHaveTextContent("Studio");
  });

  it("renders the heading without a list when there are no calendars", () => {
    render(
      <MemoryRouter>
        <CalendarSidebar calendars={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("complementary", { name: "Calendars" })).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-calendar-row")).not.toBeInTheDocument();
  });

  it("renders its children in a slot above the calendar list", () => {
    render(
      <MemoryRouter>
        <CalendarSidebar calendars={[STUDIO]}>
          <button type="button">New event</button>
        </CalendarSidebar>
      </MemoryRouter>,
    );

    const slot = screen.getByTestId("calendar-sidebar-slot");
    expect(within(slot).getByRole("button", { name: "New event" })).toBeInTheDocument();
  });
});
