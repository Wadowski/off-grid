// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { calendarSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCalendar } from "../../calendars/calendar-api.js";
import type { CalendarsState, ShellContext } from "../../types.js";
import { CreateCalendarPage } from "./create-calendar-page.js";

vi.mock("../../calendars/calendar-api.js", () => ({ createCalendar: vi.fn() }));

const createCalendarMock = vi.mocked(createCalendar);
const FAMILY_ID = "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f";

const refreshCalendars = vi.fn(async () => undefined);
const calendarsState: CalendarsState = {
  calendars: [],
  listStatus: "ready",
  refreshCalendars,
};

const shell: ShellContext = {
  families: [
    { id: FAMILY_ID, name: "The Smiths", role: "admin", accent: "blue", purpose: "household" },
  ],
  listStatus: "ready",
  createStatus: "idle",
  submitFamily: vi.fn(async () => true),
  refreshFamilies: vi.fn(async () => undefined),
  calendars: calendarsState,
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/calendar/new"]}>
      <Routes>
        <Route element={<Outlet context={shell} />}>
          <Route path="calendar/new" element={<CreateCalendarPage />} />
          <Route path="calendar/calendars" element={<p>Calendar list screen</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const fillAndSubmit = (name: string, color: "teal" | "blue" = "blue") => {
  fireEvent.change(screen.getByPlaceholderText("Enter a calendar name"), {
    target: { value: name },
  });
  fireEvent.click(screen.getByTestId(`calendar-color-${color}`));
  fireEvent.click(screen.getByTestId("calendar-submit"));
};

describe("CreateCalendarPage", () => {
  beforeEach(() => {
    createCalendarMock.mockReset();
    refreshCalendars.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("creates a personal calendar with the chosen name and color", async () => {
    createCalendarMock.mockResolvedValue(
      calendarSchema.parse({
        id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
        name: "Studio",
        color: "teal",
        familyId: null,
        isDefault: false,
      }),
    );
    renderPage();

    fillAndSubmit("Studio", "teal");

    await waitFor(() => expect(createCalendarMock).toHaveBeenCalledTimes(1));
    expect(createCalendarMock).toHaveBeenCalledWith({ name: "Studio", color: "teal" });
  });

  it("sends the chosen family when the calendar is for a family", async () => {
    createCalendarMock.mockResolvedValue(
      calendarSchema.parse({
        id: "2b7d4e6f-1a2b-4c3d-8e9f-0a1b2c3d4e5f",
        name: "Kitchen",
        color: "blue",
        familyId: FAMILY_ID,
        isDefault: false,
      }),
    );
    renderPage();

    fireEvent.change(screen.getByTestId("calendar-owner"), { target: { value: FAMILY_ID } });
    fillAndSubmit("Kitchen");

    await waitFor(() => expect(createCalendarMock).toHaveBeenCalledTimes(1));
    expect(createCalendarMock).toHaveBeenCalledWith({
      name: "Kitchen",
      color: "blue",
      familyId: FAMILY_ID,
    });
  });

  it("refreshes the list and goes back to the calendars list on success", async () => {
    createCalendarMock.mockResolvedValue(
      calendarSchema.parse({
        id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
        name: "Studio",
        color: "blue",
        familyId: null,
        isDefault: false,
      }),
    );
    renderPage();

    fillAndSubmit("Studio");

    expect(await screen.findByText("Calendar list screen")).toBeInTheDocument();
    expect(refreshCalendars).toHaveBeenCalledTimes(1);
  });

  it("shows the mapped message when the server reports the calendar as no longer available", async () => {
    createCalendarMock.mockRejectedValue(new ApiError(404, "NOT_FOUND", "Not found."));
    renderPage();

    fillAndSubmit("Studio");

    expect(await screen.findByText("This calendar is no longer available.")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong. Try again.")).not.toBeInTheDocument();
    expect(refreshCalendars).not.toHaveBeenCalled();
  });

  it("stays on the form and shows the failure text when saving fails", async () => {
    createCalendarMock.mockRejectedValue(new Error("network"));
    renderPage();

    fillAndSubmit("Studio");

    expect(await screen.findByText("Something went wrong. Try again.")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-form")).toBeInTheDocument();
    expect(refreshCalendars).not.toHaveBeenCalled();
  });
});
