// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calendarEventSchema } from "@offgrid/contracts";
import { createCalendarEvent } from "../create-calendar-event.js";
import { syncEventGuests } from "../guests/sync-event-guests.js";
import { useGuestCandidates } from "../guests/use-guest-candidates.js";
import { NewEventModal } from "./new-event-modal.js";

vi.mock("../create-calendar-event.js", () => ({
  createCalendarEvent: vi.fn(),
}));

vi.mock("../guests/sync-event-guests.js", () => ({
  syncEventGuests: vi.fn(),
}));

vi.mock("../guests/use-guest-candidates.js", () => ({
  useGuestCandidates: vi.fn(() => ({ status: "ready", candidates: [], retry: vi.fn() })),
}));

vi.mock("../guests/use-event-guests.js", () => ({
  useEventGuests: vi.fn(() => ({ status: "ready", guests: [], retry: vi.fn() })),
}));

const BEN = "7c2e9d1b-4a6f-4b8e-9c3d-2f1a0b9e8d7c";

const CREATED_EVENT = calendarEventSchema.parse({
  id: "3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f",
  calendarId: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  title: "Studio review",
  location: null,
  description: null,
  isAllDay: false,
  startsAt: "2026-07-01T10:00:00.000Z",
  endsAt: "2026-07-01T11:00:00.000Z",
  startDate: null,
  endDate: null,
  readOnly: false,
});

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

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

describe("NewEventModal", () => {
  beforeEach(() => {
    vi.mocked(createCalendarEvent).mockReset();
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
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
  });

  it("shows the new event form with the calendar picked and the save action", () => {
    renderModal();

    expect(screen.getByRole("heading", { name: "New Event" })).toBeInTheDocument();
    expect(screen.getByLabelText("Calendar")).toHaveValue(STUDIO.id);
    expect(screen.getByRole("button", { name: "Create Event" })).toBeEnabled();
    expect(screen.getByTestId("guest-field")).toBeInTheDocument();
  });

  it("does not save an event without a title and says so on the title field", () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    expect(screen.getByText("Enter an event title.")).toBeInTheDocument();
    expect(createCalendarEvent).not.toHaveBeenCalled();
  });

  it("says a title over 200 characters is too long and saves nothing", () => {
    renderModal();
    typeTitle("a".repeat(201));

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    expect(screen.getByText("The title must be 200 characters or fewer.")).toBeInTheDocument();
    expect(createCalendarEvent).not.toHaveBeenCalled();
  });

  it("refuses an end before the start with the server's message and saves nothing", () => {
    renderModal();
    typeTitle("Studio review");
    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2030-05-10" } });
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2030-05-10" } });
    fireEvent.change(screen.getByLabelText("Start time"), { target: { value: "12:00" } });
    fireEvent.change(screen.getByLabelText("End time"), { target: { value: "10:00" } });

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    expect(screen.getByText("The event must not end before it starts")).toBeInTheDocument();
    expect(createCalendarEvent).not.toHaveBeenCalled();
  });

  it("says the start and end are missing when a time is blank, and saves nothing", () => {
    renderModal();
    typeTitle("Studio review");
    fireEvent.change(screen.getByLabelText("Start time"), { target: { value: "" } });

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a start and end date and time.");
    expect(screen.queryByText("We could not save this event. Try again.")).not.toBeInTheDocument();
    expect(createCalendarEvent).not.toHaveBeenCalled();
  });

  it("saves the event to the picked calendar and reports it saved", async () => {
    const onSaved = vi.fn();
    vi.mocked(createCalendarEvent).mockResolvedValue(CREATED_EVENT);
    vi.mocked(syncEventGuests).mockResolvedValue({ toInvite: [], toRemove: [] });
    renderModal({ onSaved });
    typeTitle("Studio review");

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

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

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not save this event. Try again.",
    );
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Create Event" })).toBeEnabled();
  });

  it("invites the chosen family members after the event is created", async () => {
    const onSaved = vi.fn();
    vi.mocked(useGuestCandidates).mockReturnValue({
      status: "ready",
      candidates: [{ userId: BEN, name: "Ben", familyName: "The Smiths" }],
      retry: vi.fn(),
    });
    vi.mocked(createCalendarEvent).mockResolvedValue(CREATED_EVENT);
    vi.mocked(syncEventGuests).mockResolvedValue({ toInvite: [], toRemove: [] });
    renderModal({ onSaved });
    typeTitle("Studio review");
    fireEvent.click(screen.getByRole("button", { name: "Add guests" }));
    fireEvent.click(screen.getByTestId(`guest-option-${BEN}`));

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(syncEventGuests).toHaveBeenCalledWith(CREATED_EVENT.id, {
      toInvite: [BEN],
      toRemove: [],
    });
  });

  it("keeps the form open and says so when a guest cannot be invited", async () => {
    const onSaved = vi.fn();
    vi.mocked(useGuestCandidates).mockReturnValue({
      status: "ready",
      candidates: [{ userId: BEN, name: "Ben", familyName: "The Smiths" }],
      retry: vi.fn(),
    });
    vi.mocked(createCalendarEvent).mockResolvedValue(CREATED_EVENT);
    vi.mocked(syncEventGuests).mockResolvedValue({ toInvite: [BEN], toRemove: [] });
    renderModal({ onSaved });
    typeTitle("Studio review");
    fireEvent.click(screen.getByRole("button", { name: "Add guests" }));
    fireEvent.click(screen.getByTestId(`guest-option-${BEN}`));

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Event saved, but some guests could not be invited. Try again.",
    );
    expect(onSaved).not.toHaveBeenCalled();
    expect(createCalendarEvent).toHaveBeenCalledTimes(1);
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
