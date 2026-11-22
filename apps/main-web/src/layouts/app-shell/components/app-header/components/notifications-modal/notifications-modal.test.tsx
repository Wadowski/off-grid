// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationsInboxContext } from "../../../../../../notifications/inbox-context/notifications-inbox-context.js";
import type {
  NotificationItem,
  NotificationsInbox,
} from "../../../../../../notifications/inbox-store/types.js";
import { INBOX_PAGE_SIZE } from "../../../../../../notifications/inbox-store/constants.js";
import { NotificationsModal } from "./notifications-modal.js";

const noticeOf = (id: string, overrides: Partial<NotificationItem> = {}): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: { eventId: `event-${id}` },
  createdAt: new Date().toISOString(),
  readAt: null,
  ...overrides,
});

const noticesOf = (count: number): NotificationItem[] =>
  Array.from({ length: count }, (_, index) => noticeOf(`notice-${index}`));

const inboxWith = (overrides: Partial<NotificationsInbox> = {}): NotificationsInbox => {
  const items = noticesOf(3);
  return {
    items,
    filters: { unread: false },
    nextCursor: null,
    unreadCount: items.length,
    total: items.length,
    status: "ready",
    errorKind: undefined,
    setFilters: vi.fn(),
    reload: vi.fn(async () => undefined),
    loadMore: vi.fn(async () => undefined),
    markRead: vi.fn(async () => undefined),
    markAllRead: vi.fn(async () => undefined),
    ...overrides,
  };
};

const renderModal = (inbox: NotificationsInbox, onClose = vi.fn()) =>
  render(
    <NotificationsInboxContext.Provider value={inbox}>
      <MemoryRouter initialEntries={["/calendar"]}>
        <Routes>
          <Route path="/calendar" element={<NotificationsModal onClose={onClose} />} />
          <Route path="/notifications" element={<p>Full notifications page</p>} />
          <Route path="/calendar/event/:eventId" element={<p>Event details route</p>} />
        </Routes>
      </MemoryRouter>
    </NotificationsInboxContext.Provider>,
  );

const dialogOf = (): HTMLDialogElement =>
  screen.getByTestId("notifications-modal") as HTMLDialogElement;

const closeDialog = (): void => {
  const dialog = dialogOf();
  dialog.removeAttribute("open");
  dialog.dispatchEvent(new Event("close"));
};

describe("NotificationsModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      closeDialog();
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the title, mark all, close, the four filters and a card per notice", () => {
    renderModal(inboxWith());

    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByTestId("notifications-mark-all-read")).toBeInTheDocument();
    expect(screen.getByTestId("notifications-modal-close")).toBeInTheDocument();
    for (const option of ["all", "unread", "calendar", "account-security"]) {
      expect(screen.getByTestId(`notifications-filter-${option}`)).toBeInTheDocument();
    }
    expect(screen.getAllByTestId("notification-card")).toHaveLength(3);
  });

  it("lists at most the first page and offers no load-more control", () => {
    renderModal(
      inboxWith({
        items: noticesOf(INBOX_PAGE_SIZE + 5),
        total: INBOX_PAGE_SIZE + 5,
        nextCursor: "next",
      }),
    );

    expect(screen.getAllByTestId("notification-card")).toHaveLength(INBOX_PAGE_SIZE);
    expect(screen.queryByTestId("notifications-load-older")).toBeNull();
  });

  it("filters by the chosen option and shows the total on the selected chip", () => {
    const inbox = inboxWith({ total: 7 });
    renderModal(inbox);

    expect(screen.getByTestId("notifications-filter-all")).toHaveTextContent("7");
    fireEvent.click(screen.getByTestId("notifications-filter-calendar"));

    expect(inbox.setFilters).toHaveBeenCalledWith({ category: "calendar", unread: false });
  });

  it("marks all notices read and is disabled when nothing is unread", () => {
    const inbox = inboxWith();
    const { unmount } = renderModal(inbox);

    fireEvent.click(screen.getByTestId("notifications-mark-all-read"));
    expect(inbox.markAllRead).toHaveBeenCalledTimes(1);
    unmount();

    renderModal(inboxWith({ unreadCount: 0 }));
    expect(screen.getByTestId("notifications-mark-all-read")).toBeDisabled();
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();
    renderModal(inboxWith(), onClose);

    fireEvent.click(screen.getByTestId("notifications-modal-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    renderModal(inboxWith(), onClose);

    fireEvent(dialogOf(), new Event("cancel", { cancelable: true }));
    closeDialog();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a backdrop click", () => {
    const onClose = vi.fn();
    renderModal(inboxWith(), onClose);

    fireEvent.click(dialogOf());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("opens the full notifications page and closes", () => {
    const onClose = vi.fn();
    renderModal(inboxWith(), onClose);

    fireEvent.click(screen.getByTestId("notifications-modal-view-all"));

    expect(screen.getByText("Full notifications page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("marks an event notice read, opens the event and closes", async () => {
    const inbox = inboxWith({ items: [noticeOf("reminder")], unreadCount: 1, total: 1 });
    const onClose = vi.fn();
    renderModal(inbox, onClose);

    const card = screen.getByTestId("notification-card");
    fireEvent.click(within(card).getByTestId("notification-card-action"));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(inbox.markRead).toHaveBeenCalledWith("reminder");
  });

  it("shows the loading state", () => {
    renderModal(inboxWith({ status: "loading", items: [], unreadCount: 0, total: 0 }));

    expect(screen.getByRole("status")).toHaveTextContent("Loading notifications");
  });

  it("shows the empty state when there are no notices", () => {
    renderModal(inboxWith({ items: [], unreadCount: 0, total: 0 }));

    expect(screen.getByTestId("notifications-empty-state")).toHaveTextContent(
      "You are all caught up",
    );
  });

  it("shows the load error and retries through reload", () => {
    const inbox = inboxWith({ status: "error", errorKind: "load", items: [] });
    renderModal(inbox);

    expect(screen.getByText("Notifications could not be loaded")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(inbox.reload).toHaveBeenCalledTimes(1);
  });

  it("shows the live updates warning for a stream error", () => {
    renderModal(inboxWith({ errorKind: "stream" }));

    expect(screen.getByText(/Live updates are unavailable/)).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderModal(inboxWith());

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  });
});
