// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calendarEventSchema, calendarSchema } from "@offgrid/contracts";
import { webCalendarClient } from "../../api/web-api-client.js";
import { createCalendarEvent } from "../create-calendar-event.js";
import { defaultEventForm } from "../event-form.js";
import { syncEventGuests } from "../guests/sync-event-guests.js";
import { useGuestCandidates } from "../guests/use-guest-candidates.js";
import { NewEventModal } from "./new-event-modal.js";

vi.mock("../create-calendar-event.js", () => ({
  createCalendarEvent: vi.fn(),
}));

vi.mock("../guests/sync-event-guests.js", () => ({
  syncEventGuests: vi.fn(async () => ({ toInvite: [], toRemove: [] })),
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

vi.mock("../../api/web-api-client.js", () => ({
  webCalendarClient: { updateCalendarEvent: vi.fn() },
}));

const EVENT_ID = "3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f";

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

const renderEditModal = (
  reminderOffsetsMinutes: readonly number[],
  onSaved: () => void = vi.fn(),
) =>
  render(
    <NewEventModal
      calendars={[STUDIO]}
      timeZone="Europe/Warsaw"
      onClose={vi.fn()}
      onSaved={onSaved}
      editing={{
        eventId: EVENT_ID,
        initialValues: {
          ...defaultEventForm({
            now: new Date("2026-07-01T09:20:00Z"),
            calendarId: STUDIO.id,
            timeZone: "Europe/Warsaw",
          }),
          title: "Studio review",
          reminderOffsetsMinutes,
        },
      }}
    />,
  );

const typeTitle = (title: string) =>
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: title } });

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

describe("NewEventModal", () => {
  beforeEach(() => {
    vi.mocked(createCalendarEvent).mockReset();
    vi.mocked(webCalendarClient.updateCalendarEvent).mockReset();
    vi.mocked(syncEventGuests).mockResolvedValue({ toInvite: [], toRemove: [] });
    vi.mocked(useGuestCandidates).mockReturnValue({
      status: "ready",
      candidates: [],
      retry: vi.fn(),
    });
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
      candidates: [
        { userId: BEN, name: "Ben", familyId: "family-smiths", familyName: "The Smiths" },
      ],
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
      candidates: [
        { userId: BEN, name: "Ben", familyId: "family-smiths", familyName: "The Smiths" },
      ],
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

  it("creates the event with its reminders converted to minutes", async () => {
    const onSaved = vi.fn();
    vi.mocked(createCalendarEvent).mockResolvedValue(CREATED_EVENT);
    renderModal({ onSaved });
    typeTitle("Studio review");
    fireEvent.click(screen.getByTestId("reminder-add"));
    fireEvent.change(screen.getByTestId("reminder-amount-0"), { target: { value: "2" } });
    fireEvent.change(screen.getByTestId("reminder-unit-0"), { target: { value: "hour" } });

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(createCalendarEvent).toHaveBeenCalledWith(
      STUDIO.id,
      expect.objectContaining({ reminderOffsetsMinutes: [120] }),
    );
  });

  it("creates the event without reminder offsets when there are none", async () => {
    vi.mocked(createCalendarEvent).mockResolvedValue(CREATED_EVENT);
    const onSaved = vi.fn();
    renderModal({ onSaved });
    typeTitle("Studio review");

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(createCalendarEvent).toHaveBeenCalledWith(
      STUDIO.id,
      expect.not.objectContaining({ reminderOffsetsMinutes: expect.anything() }),
    );
  });

  it("blocks the save and focuses the first invalid reminder", () => {
    renderModal();
    typeTitle("Studio review");
    fireEvent.click(screen.getByTestId("reminder-add"));
    fireEvent.click(screen.getByTestId("reminder-add"));
    fireEvent.change(screen.getByTestId("reminder-amount-1"), { target: { value: "15" } });

    fireEvent.click(screen.getByRole("button", { name: "Create Event" }));

    expect(createCalendarEvent).not.toHaveBeenCalled();
    expect(screen.getByTestId("reminder-amount-1")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("reminder-amount-1")).toHaveFocus();
  });

  it("fills the edit form with the reminders of the event", () => {
    renderEditModal([90, 120]);

    expect(screen.getByTestId("reminder-amount-0")).toHaveValue(90);
    expect(screen.getByTestId("reminder-amount-1")).toHaveValue(2);
    expect(screen.getByTestId("reminder-unit-1")).toHaveValue("hour");
  });

  it("saves a reminder-only change as the only field of the update", async () => {
    const onSaved = vi.fn();
    vi.mocked(webCalendarClient.updateCalendarEvent).mockResolvedValue(undefined as never);
    renderEditModal([15], onSaved);
    fireEvent.change(screen.getByTestId("reminder-amount-0"), { target: { value: "1" } });
    fireEvent.change(screen.getByTestId("reminder-unit-0"), { target: { value: "day" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(webCalendarClient.updateCalendarEvent).toHaveBeenCalledWith(EVENT_ID, {
      reminderOffsetsMinutes: [1440],
    });
  });

  it("sends an empty list when every reminder was removed", async () => {
    const onSaved = vi.fn();
    vi.mocked(webCalendarClient.updateCalendarEvent).mockResolvedValue(undefined as never);
    renderEditModal([15], onSaved);
    fireEvent.click(screen.getByTestId("reminder-remove-0"));

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(webCalendarClient.updateCalendarEvent).toHaveBeenCalledWith(EVENT_ID, {
      reminderOffsetsMinutes: [],
    });
  });

  it("sends no request when the edit form is saved unchanged", async () => {
    const onSaved = vi.fn();
    renderEditModal([15, 60], onSaved);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(webCalendarClient.updateCalendarEvent).not.toHaveBeenCalled();
  });

  it("keeps the edit form open with the save-failed alert when the update fails", async () => {
    vi.mocked(webCalendarClient.updateCalendarEvent).mockRejectedValue(new Error("down"));
    renderEditModal([15]);
    fireEvent.click(screen.getByTestId("reminder-remove-0"));

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not save this event. Try again.",
    );
  });
});
