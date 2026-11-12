// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { calendarSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { removeCalendar, updateCalendar } from "../../calendars/calendar-api.js";
import type { Calendar } from "../../calendars/types.js";
import type { CalendarsState, ShellContext } from "../../types.js";
import { EditCalendarPage } from "./edit-calendar-page.js";

vi.mock("../../calendars/calendar-api.js", () => ({
  updateCalendar: vi.fn(),
  removeCalendar: vi.fn(),
}));

const updateCalendarMock = vi.mocked(updateCalendar);
const removeCalendarMock = vi.mocked(removeCalendar);

const FAMILY_ID = "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f";
const KITCHEN_ID = "2b7d4e6f-1a2b-4c3d-8e9f-0a1b2c3d4e5f";
const HOME_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";

const KITCHEN: Calendar = calendarSchema.parse({
  id: KITCHEN_ID,
  name: "Kitchen",
  color: "amber",
  familyId: FAMILY_ID,
  isDefault: false,
});
const HOME: Calendar = calendarSchema.parse({
  id: HOME_ID,
  name: "Home",
  color: "blue",
  familyId: null,
  isDefault: true,
});

const refreshCalendars = vi.fn(async () => undefined);

const renderEdit = (
  calendars: Calendar[],
  path: string,
  listStatus: CalendarsState["listStatus"] = "ready",
) => {
  const shell: ShellContext = {
    families: [
      { id: FAMILY_ID, name: "The Smiths", role: "admin", accent: "blue", purpose: "household" },
    ],
    listStatus: "ready",
    createStatus: "idle",
    submitFamily: vi.fn(async () => true),
    refreshFamilies: vi.fn(async () => undefined),
    calendars: { calendars, listStatus, refreshCalendars },
  };
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Outlet context={shell} />}>
          <Route path="calendar/:calendarId" element={<EditCalendarPage />} />
          <Route path="calendar/calendars" element={<p>Calendar list screen</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
};

describe("EditCalendarPage", () => {
  beforeEach(() => {
    updateCalendarMock.mockReset();
    removeCalendarMock.mockReset();
    refreshCalendars.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("prefills the name and color, shows the owner read-only and saves the changes", async () => {
    updateCalendarMock.mockResolvedValue({ ...KITCHEN, name: "Pantry", color: "rose" });
    renderEdit([KITCHEN], `/calendar/${KITCHEN_ID}`);

    expect(screen.getByPlaceholderText("Enter a calendar name")).toHaveValue("Kitchen");
    expect(screen.getByTestId("calendar-color-amber")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("The Smiths")).toBeInTheDocument();
    expect(screen.queryByTestId("calendar-owner")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Enter a calendar name"), {
      target: { value: "Pantry" },
    });
    fireEvent.click(screen.getByTestId("calendar-color-rose"));
    fireEvent.click(screen.getByTestId("calendar-submit"));

    expect(await screen.findByText("Calendar list screen")).toBeInTheDocument();
    expect(updateCalendarMock).toHaveBeenCalledWith(KITCHEN_ID, { name: "Pantry", color: "rose" });
    expect(refreshCalendars).toHaveBeenCalledTimes(1);
  });

  it("hides the delete button for the default calendar", () => {
    renderEdit([HOME], `/calendar/${HOME_ID}`);

    expect(screen.queryByTestId("calendar-delete")).not.toBeInTheDocument();
  });

  it("deletes a family calendar only after confirming", async () => {
    removeCalendarMock.mockResolvedValue(undefined);
    renderEdit([KITCHEN], `/calendar/${KITCHEN_ID}`);

    fireEvent.click(screen.getByTestId("calendar-delete"));
    expect(
      screen.getByText("Delete this calendar and its events? This cannot be undone."),
    ).toBeInTheDocument();
    expect(removeCalendarMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("calendar-delete-submit"));

    expect(await screen.findByText("Calendar list screen")).toBeInTheDocument();
    expect(removeCalendarMock).toHaveBeenCalledWith(KITCHEN_ID);
  });

  it("keeps the calendar when the delete confirmation is cancelled", () => {
    renderEdit([KITCHEN], `/calendar/${KITCHEN_ID}`);

    fireEvent.click(screen.getByTestId("calendar-delete"));
    fireEvent.click(screen.getByTestId("calendar-delete-cancel"));

    expect(screen.getByTestId("calendar-delete")).toBeInTheDocument();
    expect(removeCalendarMock).not.toHaveBeenCalled();
  });

  it("shows the default-calendar text when the API refuses the delete", async () => {
    removeCalendarMock.mockRejectedValue(new ApiError(409, "DEFAULT_CALENDAR", "Default."));
    renderEdit([KITCHEN], `/calendar/${KITCHEN_ID}`);

    fireEvent.click(screen.getByTestId("calendar-delete"));
    fireEvent.click(screen.getByTestId("calendar-delete-submit"));

    expect(await screen.findByText("Your default calendar can't be deleted.")).toBeInTheDocument();
    expect(refreshCalendars).not.toHaveBeenCalled();
  });

  it("shows the not-found text when the save finds no calendar", async () => {
    updateCalendarMock.mockRejectedValue(new ApiError(404, "NOT_FOUND", "Not found."));
    renderEdit([KITCHEN], `/calendar/${KITCHEN_ID}`);

    fireEvent.click(screen.getByTestId("calendar-submit"));

    expect(await screen.findByText("This calendar is no longer available.")).toBeInTheDocument();
  });

  it("shows the not-found text for a calendar the person cannot access", () => {
    renderEdit([KITCHEN], "/calendar/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d");

    expect(screen.getByText("This calendar is no longer available.")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-back")).toHaveAttribute("href", "/calendar/calendars");
  });

  it("waits for the calendar list before showing the form", () => {
    renderEdit([], `/calendar/${KITCHEN_ID}`, "loading");

    expect(screen.getByText("Loading calendars…")).toBeInTheDocument();
    expect(screen.queryByTestId("calendar-form")).not.toBeInTheDocument();
  });
});
