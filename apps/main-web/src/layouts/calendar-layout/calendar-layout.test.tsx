// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import type { ShellContext } from "../../types.js";
import { CalendarLayout } from "./calendar-layout.js";

const STUDIO = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
});

const shellContext: ShellContext = {
  families: [],
  listStatus: "ready",
  createStatus: "idle",
  submitFamily: async () => true,
  refreshFamilies: async () => {},
  calendars: {
    calendars: [STUDIO],
    listStatus: "ready",
    refreshCalendars: async () => {},
  },
};

describe("CalendarLayout", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the calendar sidebar beside the page content", () => {
    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <Routes>
          <Route element={<Outlet context={shellContext} />}>
            <Route path="calendar" element={<CalendarLayout />}>
              <Route index element={<p>Page content</p>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const layout = screen.getByTestId("calendar-sidebar").parentElement!;
    expect(within(layout).getByText("Page content")).toBeInTheDocument();
    expect(within(screen.getByTestId("calendar-sidebar")).getByText("Studio")).toBeInTheDocument();
  });
});
