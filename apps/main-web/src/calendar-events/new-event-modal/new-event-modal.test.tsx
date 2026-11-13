// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCalendarEvent } from "../create-calendar-event.js";
import { NewEventModal } from "./new-event-modal.js";

vi.mock("../create-calendar-event.js", () => ({
  createCalendarEvent: vi.fn(),
}));

const STUDIO = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
});

const renderModal = (handlers: { onClose?: () => void; onSaved?: () => void } = {}) =>
  render(
    <NewEventModal
      calendars={[STUDIO]}
      timeZone="Europe/Warsaw"
      onClose={handlers.onClose ?? vi.fn()}
      onSaved={handlers.onSaved ?? vi.fn()}
    />,
  );

const typeTitle = (title: string) =>
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: title } });

describe("NewEventModal", () => {
  beforeEach(() => {
    vi.mocked(createCalendarEvent).mockReset();
    // jsdom has no modal dialog: open the dialog as a browser does, and fire its close event on close.
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the new event form with the calendar picked and the save action", () => {
    renderModal();

    expect(screen.getByRole("heading", { name: "New event" })).toBeInTheDocument();
    expect(screen.getByLabelText("Calendar")).toHaveValue(STUDIO.id);
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    expect(screen.queryByLabelText("Guests")).not.toBeInTheDocument();
  });

  it("does not save an event without a title and says so on the title field", () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Enter an event title.")).toBeInTheDocument();
    expect(createCalendarEvent).not.toHaveBeenCalled();
  });

  it("refuses an end before the start with the server's message and saves nothing", () => {
    renderModal();
    typeTitle("Studio review");
    fireEvent.change(screen.getByLabelText("Start time"), { target: { value: "12:00" } });
    fireEvent.change(screen.getByLabelText("End time"), { target: { value: "10:00" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("The event must not end before it starts")).toBeInTheDocument();
    expect(createCalendarEvent).not.toHaveBeenCalled();
  });

  it("saves the event to the picked calendar and reports it saved", async () => {
    const onSaved = vi.fn();
    vi.mocked(createCalendarEvent).mockResolvedValue({} as never);
    renderModal({ onSaved });
    typeTitle("Studio review");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(createCalendarEvent).toHaveBeenCalledWith(
      STUDIO.id,
      expect.objectContaining({ title: "Studio review", isAllDay: false }),
    );
  });

  it("keeps the form open and says so when the server refuses the save", async () => {
    const onSaved = vi.fn();
    vi.mocked(createCalendarEvent).mockRejectedValue(new Error("down"));
    renderModal({ onSaved });
    typeTitle("Studio review");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not save this event. Try again.",
    );
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("closes without saving when Cancel is pressed, and sends no request", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    typeTitle("Studio review");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(createCalendarEvent).not.toHaveBeenCalled();
  });
});
