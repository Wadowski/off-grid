// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import type { Calendar } from "../../calendars/types.js";
import { jsonResponse } from "../../test-support/json-response.js";
import type { CalendarsState, ShellContext } from "../../types.js";
import { CalendarViewsPage } from "./calendar-views-page.js";

const FAMILY_ID = "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f";
const STUDIO: Calendar = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: true,
});

vi.mock("../../session/use-session.js", () => ({
  useSession: () => ({
    status: "signedIn",
    activeFamilyId: "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f",
    user: {
      id: "u1",
      email: "anna@example.test",
      displayName: "Anna Miller",
      instanceRole: "user",
    },
  }),
}));

const shellWith = (calendars: CalendarsState): ShellContext => ({
  families: [
    {
      id: FAMILY_ID,
      name: "The Miller Family",
      role: "admin",
      accent: "blue",
      purpose: "household",
    },
  ],
  listStatus: "ready",
  createStatus: "idle",
  submitFamily: vi.fn(async () => true),
  refreshFamilies: vi.fn(async () => undefined),
  calendars,
});

const readyCalendars = (list: Calendar[]): CalendarsState => ({
  calendars: list,
  listStatus: "ready",
  refreshCalendars: vi.fn(async () => undefined),
});

const viewBody = { view: "week", startDate: "2025-10-20", endDate: "2025-10-26", days: [] };

const stubApi = (viewStatus = 200) => {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.includes("time-zone")) {
      return jsonResponse({ status: 200, body: { timeZone: "UTC", isSet: false } });
    }
    return viewStatus === 200
      ? jsonResponse({ status: 200, body: viewBody })
      : jsonResponse({ status: 500, body: { code: "INTERNAL", message: "boom" } });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const LocationProbe = () => {
  const location = useLocation();
  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
};

const renderPage = (path: string, view: "agenda" | "day" | "week" | "month") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <Routes>
        <Route element={<Outlet context={shellWith(readyCalendars([STUDIO]))} />}>
          <Route path="calendar/week" element={<CalendarViewsPage view={view} />} />
          <Route path="calendar/agenda" element={<CalendarViewsPage view={view} />} />
          <Route path="calendar/calendars" element={<p>Calendars list</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("CalendarViewsPage", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the title and the period of the selected week without the family name", async () => {
    stubApi();

    renderPage("/calendar/week?date=2025-10-23", "week");

    expect(screen.queryByText("The Miller Family")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Calendar" })).toBeInTheDocument();
    expect(screen.getByText("Oct 20 - 26")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });

  it("moves the week by one week from the next arrow and keeps the view", async () => {
    stubApi();
    renderPage("/calendar/week?date=2025-10-23", "week");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Oct 27 - Nov 2")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/calendar/week?date=2025-10-30");
  });

  it("hides a calendar's events when the person unticks it in the calendar filter", async () => {
    stubApi();
    renderPage("/calendar/week?date=2025-10-23", "week");

    fireEvent.click(screen.getByRole("button", { name: /^Calendar filter/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Studio" }));

    expect(
      screen.getByRole("button", { name: "Calendar filter: No calendars" }),
    ).toBeInTheDocument();
  });

  it("opens the calendars list from the Calendars button", async () => {
    stubApi();
    renderPage("/calendar/week?date=2025-10-23", "week");

    fireEvent.click(screen.getByRole("button", { name: "Calendars" }));

    expect(await screen.findByText("Calendars list")).toBeInTheDocument();
  });

  it("shows the error text and retries the same view when it fails", async () => {
    const fetchMock = stubApi(500);
    renderPage("/calendar/week?date=2025-10-23", "week");

    expect(await screen.findByRole("alert")).toHaveTextContent("We could not load this view.");
    const viewCalls = fetchMock.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(viewCalls));
  });

  it("switches to another view from the view selector and keeps the date", () => {
    stubApi();
    renderPage("/calendar/agenda?date=2025-10-23", "agenda");

    fireEvent.change(screen.getByRole("combobox", { name: "Calendar view" }), {
      target: { value: "month" },
    });

    expect(screen.getByTestId("location")).toHaveTextContent("/calendar/month?date=2025-10-23");
  });

  it("switches from the agenda to the day view from the view selector", () => {
    stubApi();
    renderPage("/calendar/agenda?date=2025-10-23", "agenda");

    fireEvent.change(screen.getByRole("combobox", { name: "Calendar view" }), {
      target: { value: "day" },
    });

    expect(screen.getByTestId("location")).toHaveTextContent("/calendar/day?date=2025-10-23");
  });

  it("has no search button, avatar or day scheduled count", () => {
    stubApi();
    renderPage("/calendar/agenda?date=2025-10-23", "agenda");

    expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Scheduled/)).not.toBeInTheDocument();
  });
});
