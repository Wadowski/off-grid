// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema } from "@offgrid/contracts";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { webCalendarClient } from "../../api/web-api-client.js";
import { notifyEventsChanged } from "../notify-events-changed.js";
import { useGuestCandidates } from "../guests/use-guest-candidates.js";
import { NewEventModal } from "./new-event-modal.js";

vi.mock("../../api/web-api-client.js", () => ({
  webCalendarClient: {
    listEventGuests: vi.fn(),
    updateCalendarEvent: vi.fn(),
  },
}));

vi.mock("../guests/use-guest-candidates.js", () => ({
  useGuestCandidates: vi.fn(),
}));

const BEN = "7c2e9d1b-4a6f-4b8e-9c3d-2f1a0b9e8d7c";
const CARA = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const EVENT_ID = "3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f";

const STUDIO = calendarSchema.parse({
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
});

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

const renderEdit = () =>
  render(
    <NewEventModal
      calendars={[STUDIO]}
      timeZone="Europe/Warsaw"
      onClose={vi.fn()}
      onSaved={vi.fn()}
      editing={{
        eventId: EVENT_ID,
        initialValues: {
          title: "Studio review",
          calendarId: STUDIO.id,
          isAllDay: false,
          startDate: "2026-07-01",
          startTime: "12:00",
          endDate: "2026-07-01",
          endTime: "13:00",
          location: "",
          description: "",
          guestUserIds: [],
        },
      }}
    />,
  );

describe("NewEventModal guest selection while the guests refresh", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
    vi.mocked(webCalendarClient.listEventGuests).mockResolvedValue([
      { userId: BEN, invitedAt: "2026-11-20T10:00:00.000Z" },
    ]);
    vi.mocked(useGuestCandidates).mockReturnValue({
      status: "ready",
      candidates: [
        { userId: BEN, name: "Ben", familyName: "The Smiths" },
        { userId: CARA, name: "Cara", familyName: "The Smiths" },
      ],
      retry: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
  });

  it("keeps a guest the person picked when the events change and the guests reload", async () => {
    renderEdit();
    await screen.findByTestId(`guest-chip-${BEN}`);
    fireEvent.click(screen.getByTestId("guest-field-add"));
    fireEvent.click(screen.getByTestId(`guest-option-${CARA}`));
    expect(screen.getByTestId(`guest-chip-${CARA}`)).toBeInTheDocument();

    act(() => notifyEventsChanged());

    await waitFor(() => expect(webCalendarClient.listEventGuests).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByTestId(`guest-chip-${CARA}`)).toBeInTheDocument());
    expect(screen.getByTestId(`guest-chip-${BEN}`)).toBeInTheDocument();
  });
});
