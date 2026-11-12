// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Calendar } from "../../calendars/types.js";
import type { CalendarsState, ShellContext } from "../../types.js";
import { CalendarsPage } from "./calendars-page.js";

const FAMILY_ID = "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f";

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
  familyId: FAMILY_ID,
  isDefault: false,
});

const shellWith = (calendars: CalendarsState): ShellContext => ({
  families: [
    { id: FAMILY_ID, name: "The Smiths", role: "admin", accent: "blue", purpose: "household" },
  ],
  listStatus: "ready",
  createStatus: "idle",
  submitFamily: vi.fn(async () => true),
  refreshFamilies: vi.fn(async () => undefined),
  calendars,
});

const renderPage = (calendars: CalendarsState) =>
  render(
    <MemoryRouter initialEntries={["/calendar"]}>
      <Routes>
        <Route element={<Outlet context={shellWith(calendars)} />}>
          <Route path="calendar" element={<CalendarsPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const ready = (list: Calendar[]): CalendarsState => ({
  calendars: list,
  listStatus: "ready",
  refreshCalendars: vi.fn(async () => undefined),
});

describe("CalendarsPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists each calendar with its owner and a Default badge where it applies", () => {
    renderPage(ready([STUDIO, KITCHEN]));

    const rows = within(screen.getByTestId("calendar-list")).getAllByTestId("calendar-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("href", `/calendar/${STUDIO.id}`);
    expect(within(rows[0]!).getByText("Studio")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Personal")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Default")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Kitchen")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("The Smiths")).toBeInTheDocument();
    expect(within(rows[1]!).queryByText("Default")).not.toBeInTheDocument();
  });

  it("says when there are no calendars yet", () => {
    renderPage(ready([]));

    expect(screen.getByText("You have no calendars yet.")).toBeInTheDocument();
    expect(screen.queryByTestId("calendar-list")).not.toBeInTheDocument();
  });

  it("shows a failure message when the list cannot be loaded", () => {
    renderPage({ calendars: [], listStatus: "failed", refreshCalendars: vi.fn() });

    expect(screen.getByText("Your calendars could not be loaded.")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong. Try again.")).toBeInTheDocument();
  });

  it("offers a new calendar button", () => {
    renderPage(ready([]));

    expect(screen.getByTestId("calendars-new")).toHaveTextContent("New calendar");
  });
});
