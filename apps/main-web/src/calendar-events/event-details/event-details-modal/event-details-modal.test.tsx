// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventSchema } from "@offgrid/contracts";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CalendarEventDetails } from "../types.js";
import { DeleteConfirm } from "../components/delete-confirm/delete-confirm.js";
import { EventDetailsModal } from "./event-details-modal.js";

const EVENT: CalendarEventDetails = calendarEventSchema.parse({
  id: "3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f",
  calendarId: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  calendarName: "Studio",
  calendarColor: "teal",
  title: "Studio review",
  location: "West Gate",
  description: "Bring the deck",
  isAllDay: false,
  startsAt: "2026-11-16T09:00:00.000Z",
  endsAt: "2026-11-16T10:00:00.000Z",
  startDate: null,
  endDate: null,
  readOnly: false,
});

const originalShowModal = HTMLDialogElement.prototype.showModal;

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
});

afterEach(() => {
  HTMLDialogElement.prototype.showModal = originalShowModal;
});

const handlers = () => ({
  onClose: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  retry: vi.fn(),
});

describe("EventDetailsModal", () => {
  it("shows the details and the edit and delete controls to an owner or editor", () => {
    render(<EventDetailsModal event={EVENT} status="ready" timeZone="UTC" {...handlers()} />);

    expect(screen.getByText("Studio review")).toBeInTheDocument();
    expect(screen.getByText("West Gate")).toBeInTheDocument();
    expect(screen.getByText("Bring the deck")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Event" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete event" })).toBeInTheDocument();
  });

  it("shows the event read-only to a guest, with no edit or delete control", () => {
    render(
      <EventDetailsModal
        event={{ ...EVENT, readOnly: true }}
        status="ready"
        timeZone="UTC"
        {...handlers()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Edit Event" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete event" })).not.toBeInTheDocument();
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("shows the not-found text when the event no longer exists", () => {
    render(
      <EventDetailsModal event={undefined} status="notFound" timeZone="UTC" {...handlers()} />,
    );

    expect(screen.getByText("This event is no longer available.")).toBeInTheDocument();
  });

  it("calls the delete handler when the delete control is pressed", () => {
    const props = handlers();
    render(<EventDetailsModal event={EVENT} status="ready" timeZone="UTC" {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete event" }));
    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });
});

describe("DeleteConfirm", () => {
  it("asks before deleting and only the confirm action deletes", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <DeleteConfirm
        narrow={false}
        deleting={false}
        failed={false}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Delete this event?")).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete event" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
