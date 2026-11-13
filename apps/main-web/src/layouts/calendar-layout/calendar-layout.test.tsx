// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ShellContext } from "../../types.js";
import { CalendarLayout } from "./calendar-layout.js";
import { useCalendarLayout } from "./calendar-layout-context.js";
import { HIDDEN_CALENDARS_KEY } from "./hidden-calendars-storage.js";

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

const HiddenProbe = () => {
  const { hidden } = useCalendarLayout();
  return <p data-testid="hidden-probe">{[...hidden].join(",")}</p>;
};

const renderWithProbe = () =>
  render(
    <MemoryRouter initialEntries={["/calendar"]}>
      <Routes>
        <Route element={<Outlet context={shellContext} />}>
          <Route path="calendar" element={<CalendarLayout />}>
            <Route index element={<HiddenProbe />} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("CalendarLayout", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.restoreAllMocks();
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

  it("gives the page the calendars hidden in an earlier visit", () => {
    window.localStorage.setItem(HIDDEN_CALENDARS_KEY, JSON.stringify([STUDIO.id]));

    renderWithProbe();

    expect(screen.getByTestId("hidden-probe")).toHaveTextContent(STUDIO.id);
  });

  it("starts with every calendar shown when nothing was stored", () => {
    renderWithProbe();

    expect(screen.getByTestId("hidden-probe")).toHaveTextContent(/^$/);
  });

  it("still renders the page when the browser blocks saved preferences", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });

    renderWithProbe();

    expect(screen.getByTestId("hidden-probe")).toHaveTextContent(/^$/);
    expect(screen.getByTestId("calendar-sidebar")).toBeInTheDocument();
  });

  it("fails fast when a page reads the layout context outside CalendarLayout", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() =>
      render(
        <MemoryRouter initialEntries={["/other"]}>
          <Routes>
            <Route element={<Outlet context={shellContext} />}>
              <Route path="other" element={<HiddenProbe />} />
            </Route>
          </Routes>
        </MemoryRouter>,
      ),
    ).toThrow("useCalendarLayout must be used inside CalendarLayout.");
  });
});
