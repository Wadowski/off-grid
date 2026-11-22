// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationItem, NotificationPage } from "../inbox-store/types.js";
import type { subscribeToNotificationStream } from "../subscribe-to-notification-stream.js";
import { NotificationsInboxProvider } from "./notifications-inbox-provider.js";
import { useNotificationsInboxContext } from "./use-notifications-inbox-context.js";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  subscribe: vi.fn<typeof subscribeToNotificationStream>(),
}));

vi.mock("../notifications-api.js", () => ({
  listNotifications: mocks.list,
  markNotificationRead: mocks.markRead,
  markAllNotificationsRead: mocks.markAllRead,
}));

vi.mock("../subscribe-to-notification-stream.js", () => ({
  subscribeToNotificationStream: mocks.subscribe,
}));

const notice = (id: string): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: {},
  createdAt: "2026-11-19T09:00:00Z",
  readAt: null,
});

const pageOf = (notifications: NotificationItem[]): NotificationPage => ({
  notifications,
  unreadCount: notifications.length,
  nextCursor: null,
  total: notifications.length,
});

const UnreadCount = () => {
  const { unreadCount } = useNotificationsInboxContext();
  return <p data-testid="unread-count">{unreadCount}</p>;
};

const MarkFirstRead = () => {
  const { markRead } = useNotificationsInboxContext();
  return <button onClick={() => void markRead("a")}>mark a</button>;
};

describe("NotificationsInboxProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.subscribe.mockResolvedValue(undefined);
    mocks.markRead.mockResolvedValue(undefined);
    mocks.list.mockResolvedValue(pageOf([notice("a"), notice("b")]));
  });

  afterEach(() => {
    cleanup();
  });

  it("shares one list request and one stream between every consumer", async () => {
    render(
      <NotificationsInboxProvider>
        <UnreadCount />
        <UnreadCount />
      </NotificationsInboxProvider>,
    );

    await waitFor(() => expect(screen.getAllByTestId("unread-count")[0]).toHaveTextContent("2"));
    expect(mocks.list).toHaveBeenCalledTimes(1);
    expect(mocks.subscribe).toHaveBeenCalledTimes(1);
  });

  it("lowers the unread count every consumer sees after one consumer marks a notice read", async () => {
    render(
      <NotificationsInboxProvider>
        <MarkFirstRead />
        <UnreadCount />
      </NotificationsInboxProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("unread-count")).toHaveTextContent("2"));

    fireEvent.click(screen.getByRole("button", { name: "mark a" }));

    await waitFor(() => expect(screen.getByTestId("unread-count")).toHaveTextContent("1"));
  });
});
