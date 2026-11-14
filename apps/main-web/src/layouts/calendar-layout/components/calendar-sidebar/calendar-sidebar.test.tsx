// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NO_HIDDEN_CALENDARS } from "../../../../calendar-views/events-by-calendar.js";
import { CalendarSidebar } from "./calendar-sidebar.js";

const STUDIO = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
});

const renderSidebar = (calendars = [STUDIO], children?: React.ReactNode) =>
  render(
    <MemoryRouter>
      <CalendarSidebar calendars={calendars} hidden={NO_HIDDEN_CALENDARS} onToggle={vi.fn()}>
        {children}
      </CalendarSidebar>
    </MemoryRouter>,
  );

describe("CalendarSidebar", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the Calendars heading and the show checkboxes as a named complementary region", () => {
    renderSidebar();

    const sidebar = screen.getByRole("complementary", { name: "Calendars" });
    expect(within(sidebar).getByText("Calendars")).toBeInTheDocument();
    expect(within(sidebar).getByRole("checkbox", { name: "Studio" })).toBeChecked();
  });

  it("renders the heading without a list when there are no calendars", () => {
    renderSidebar([]);

    expect(screen.getByRole("complementary", { name: "Calendars" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("links to the calendar management page", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Manage" })).toHaveAttribute(
      "href",
      "/calendar/calendars",
    );
  });

  it("renders its children in a slot between the heading and the calendar list", () => {
    renderSidebar([STUDIO], <button type="button">Pick a day</button>);

    const slot = screen.getByTestId("calendar-sidebar-slot");
    expect(within(slot).getByRole("button", { name: "Pick a day" })).toBeInTheDocument();
    const sidebar = screen.getByRole("complementary", { name: "Calendars" });
    const heading = within(sidebar).getByText("Calendars");
    expect(heading.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      slot.compareDocumentPosition(screen.getByRole("checkbox", { name: "Studio" })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
