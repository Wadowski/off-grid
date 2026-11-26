// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationItem, NotificationPage } from "../../notifications/inbox-store/types.js";
import type { subscribeToNotificationStream } from "../../notifications/subscribe-to-notification-stream.js";
import { NotificationsInboxProvider } from "../../notifications/index.js";
import { NotificationsPage } from "./notifications-page.js";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  subscribe: vi.fn<typeof subscribeToNotificationStream>(),
}));

vi.mock("../../notifications/notifications-api.js", () => ({
  listNotifications: mocks.list,
  markNotificationRead: mocks.markRead,
  markAllNotificationsRead: mocks.markAllRead,
}));

vi.mock("../../notifications/subscribe-to-notification-stream.js", () => ({
  subscribeToNotificationStream: mocks.subscribe,
}));

const HOUR_MS = 3_600_000;

const hoursAgo = (hours: number): string => new Date(Date.now() - hours * HOUR_MS).toISOString();

const notice = (id: string, overrides: Partial<NotificationItem> = {}): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: { eventId: `event-${id}` },
  createdAt: hoursAgo(1),
  readAt: null,
  ...overrides,
});

const pageOf = (
  notifications: NotificationItem[],
  overrides: Partial<NotificationPage> = {},
): NotificationPage => ({
  notifications,
  unreadCount: notifications.filter((item) => item.readAt === null).length,
  nextCursor: null,
  total: notifications.length,
  ...overrides,
});

const renderPage = () =>
  render(
    <NotificationsInboxProvider>
      <MemoryRouter initialEntries={["/notifications"]}>
        <Routes>
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/calendar/event/:eventId" element={<p>Event details route</p>} />
        </Routes>
      </MemoryRouter>
    </NotificationsInboxProvider>,
  );

const cardCount = () => screen.queryAllByTestId("notification-card").length;

describe("NotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.subscribe.mockResolvedValue(undefined);
    mocks.markRead.mockResolvedValue(undefined);
    mocks.markAllRead.mockResolvedValue({ updated: 0 });
    mocks.list.mockResolvedValue(pageOf([]));
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the heading, the sort text and the loaded and total counts", async () => {
    mocks.list.mockResolvedValueOnce(
      pageOf([notice("a"), notice("b")], { total: 7, nextCursor: "cursor-1" }),
    );

    renderPage();

    expect(await screen.findByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByText("Newest first")).toBeInTheDocument();
    expect(await screen.findByTestId("notifications-showing")).toHaveTextContent("Showing 2 of 7");
  });

  it("groups today's notices under a heading that counts the updates", async () => {
    mocks.list.mockResolvedValueOnce(
      pageOf([
        notice("a", { createdAt: new Date().toISOString() }),
        notice("b", { createdAt: new Date().toISOString() }),
        notice("c", { createdAt: hoursAgo(10 * 24) }),
      ]),
    );

    renderPage();

    await waitFor(() => expect(cardCount()).toBe(3));
    const groups = screen.getAllByTestId("notifications-day-group");
    expect(groups).toHaveLength(2);
    expect(within(groups[0]!).getByText("Today")).toBeInTheDocument();
    expect(within(groups[0]!).getByTestId("notifications-day-group-count")).toHaveTextContent(
      "2 updates",
    );
    expect(within(groups[1]!).queryByTestId("notifications-day-group-count")).toBeNull();
  });

  it("shows the API total on the selected chip only", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")], { total: 7 }));

    renderPage();

    await waitFor(() => expect(cardCount()).toBe(1));
    expect(screen.getByTestId("notifications-filter-all")).toHaveTextContent(/^All 7$/);
    expect(screen.getByTestId("notifications-filter-unread")).toHaveTextContent(/^Unread$/);
  });

  it("reloads with the chip's filter when a chip is selected", async () => {
    renderPage();
    await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByTestId("notifications-filter-calendar"));

    await waitFor(() =>
      expect(mocks.list).toHaveBeenLastCalledWith({ limit: 20, category: "calendar" }),
    );
    fireEvent.click(screen.getByTestId("notifications-filter-unread"));
    await waitFor(() => expect(mocks.list).toHaveBeenLastCalledWith({ limit: 20, unread: "true" }));
  });

  it("appends older notices on Load older and hides the button at the end", async () => {
    mocks.list
      .mockResolvedValueOnce(pageOf([notice("a")], { nextCursor: "cursor-1", total: 2 }))
      .mockResolvedValueOnce(
        pageOf([notice("b", { createdAt: hoursAgo(10 * 24) })], { nextCursor: null, total: 2 }),
      );

    renderPage();
    const loadOlder = await screen.findByTestId("notifications-load-older");
    fireEvent.click(loadOlder);

    await waitFor(() => expect(cardCount()).toBe(2));
    expect(screen.getByTestId("notifications-showing")).toHaveTextContent("Showing 2 of 2");
    expect(screen.queryByTestId("notifications-load-older")).toBeNull();
  });

  it("shows the empty state when there are no notices", async () => {
    renderPage();

    expect(await screen.findByText("You are all caught up")).toBeInTheDocument();
  });

  it("shows an error with a retry that loads again", async () => {
    mocks.list.mockRejectedValueOnce(new Error("offline"));
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")]));

    renderPage();
    fireEvent.click(await screen.findByTestId("notifications-retry"));

    await waitFor(() => expect(cardCount()).toBe(1));
    expect(mocks.list).toHaveBeenCalledTimes(2);
  });

  it("shows the live updates line when the stream fails", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")]));

    renderPage();
    await waitFor(() => expect(cardCount()).toBe(1));
    const [streamOptions] = mocks.subscribe.mock.calls[0]!;
    act(() => streamOptions.onError(new Error("stream failed")));

    expect(
      screen.getByText("Live updates are unavailable. Reload to see new notifications."),
    ).toBeInTheDocument();
  });

  it("marks a notice read when its card is activated", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")]));

    renderPage();
    fireEvent.click(await screen.findByTestId("notification-card-activate"));

    await waitFor(() => expect(mocks.markRead).toHaveBeenCalledWith("a"));
  });

  it("marks the notice read and opens the event from View Event", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a", { type: "event-invited" })]));

    renderPage();
    fireEvent.click(await screen.findByTestId("notification-card-action"));

    expect(await screen.findByText("Event details route")).toBeInTheDocument();
    expect(mocks.markRead).toHaveBeenCalledWith("a");
  });

  it("marks all notices read from the header", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")]));

    renderPage();
    const markAll = await screen.findByTestId("notifications-mark-all-read");
    await waitFor(() => expect(markAll).toBeEnabled());
    await act(async () => {
      fireEvent.click(markAll);
    });

    expect(mocks.markAllRead).toHaveBeenCalledTimes(1);
  });
});

describe("NotificationsPage on a phone", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.subscribe.mockResolvedValue(undefined);
    mocks.markRead.mockResolvedValue(undefined);
    mocks.markAllRead.mockResolvedValue({ updated: 0 });
    mocks.list.mockResolvedValue(pageOf([]));
    window.matchMedia = (query: string) => ({
      ...originalMatchMedia(query),
      matches: query.includes("max-width"),
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    cleanup();
  });

  const renderPhonePageFrom = (entries: string[], index: number) =>
    render(
      <NotificationsInboxProvider>
        <MemoryRouter initialEntries={entries} initialIndex={index}>
          <Routes>
            <Route path="/" element={<p>Home route</p>} />
            <Route path="/calendar" element={<p>Calendar route</p>} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </MemoryRouter>
      </NotificationsInboxProvider>,
    );

  it("shows the Back button and the mobile header instead of the desktop sort and count", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")], { total: 1 }));

    renderPhonePageFrom(["/notifications"], 0);

    expect(await screen.findByTestId("notifications-back")).toBeInTheDocument();
    expect(screen.queryByTestId("notifications-header")).toBeNull();
    expect(screen.queryByText("Newest first")).toBeNull();
    expect(screen.queryByTestId("notifications-showing")).toBeNull();
  });

  it("goes back to the previous screen when the page has history", async () => {
    renderPhonePageFrom(["/calendar", "/notifications"], 1);

    fireEvent.click(await screen.findByTestId("notifications-back"));

    expect(await screen.findByText("Calendar route")).toBeInTheDocument();
  });

  it("goes to the home page when the page was opened directly", async () => {
    renderPhonePageFrom(["/notifications"], 0);

    fireEvent.click(await screen.findByTestId("notifications-back"));

    expect(await screen.findByText("Home route")).toBeInTheDocument();
  });

  it("filters from the chip row and keeps the selected chip's total", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")], { total: 7 }));
    renderPhonePageFrom(["/notifications"], 0);
    await waitFor(() => expect(cardCount()).toBe(1));

    fireEvent.click(screen.getByTestId("notifications-filter-calendar"));

    await waitFor(() =>
      expect(mocks.list).toHaveBeenLastCalledWith({ limit: 20, category: "calendar" }),
    );
    expect(screen.getByTestId("notifications-filter-calendar")).toHaveTextContent(/^Calendar/);
  });

  it("marks all notices read from the mobile header", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")]));
    renderPhonePageFrom(["/notifications"], 0);

    const markAll = await screen.findByTestId("notifications-mark-all-read");
    await waitFor(() => expect(markAll).toBeEnabled());
    await act(async () => {
      fireEvent.click(markAll);
    });

    expect(mocks.markAllRead).toHaveBeenCalledTimes(1);
  });

  it("appends older notices on Load older", async () => {
    mocks.list
      .mockResolvedValueOnce(pageOf([notice("a")], { nextCursor: "cursor-1", total: 2 }))
      .mockResolvedValueOnce(
        pageOf([notice("b", { createdAt: hoursAgo(10 * 24) })], { nextCursor: null, total: 2 }),
      );
    renderPhonePageFrom(["/notifications"], 0);

    fireEvent.click(await screen.findByTestId("notifications-load-older"));

    await waitFor(() => expect(cardCount()).toBe(2));
    expect(screen.queryByTestId("notifications-load-older")).toBeNull();
  });

  it("shows caught up when the list ends and nothing is left to load", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")]));
    renderPhonePageFrom(["/notifications"], 0);

    expect(await screen.findByTestId("notifications-caught-up")).toHaveTextContent(
      "You're caught up",
    );
  });

  it("does not show caught up for an empty inbox", async () => {
    renderPhonePageFrom(["/notifications"], 0);

    expect(await screen.findByText("You are all caught up")).toBeInTheDocument();
    expect(screen.queryByTestId("notifications-caught-up")).toBeNull();
  });

  it("shows the load error with a retry that loads again", async () => {
    mocks.list.mockRejectedValueOnce(new Error("offline"));
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")]));
    renderPhonePageFrom(["/notifications"], 0);

    fireEvent.click(await screen.findByTestId("notifications-retry"));

    await waitFor(() => expect(cardCount()).toBe(1));
  });

  it("shows the live updates line when the stream fails", async () => {
    mocks.list.mockResolvedValueOnce(pageOf([notice("a")]));
    renderPhonePageFrom(["/notifications"], 0);
    await waitFor(() => expect(cardCount()).toBe(1));
    const [streamOptions] = mocks.subscribe.mock.calls[0]!;
    act(() => streamOptions.onError(new Error("stream failed")));

    expect(
      screen.getByText("Live updates are unavailable. Reload to see new notifications."),
    ).toBeInTheDocument();
  });
});
