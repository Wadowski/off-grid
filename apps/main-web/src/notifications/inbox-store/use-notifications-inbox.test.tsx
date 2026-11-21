// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationsInbox } from "./use-notifications-inbox.js";
import type { subscribeToNotificationStream } from "../subscribe-to-notification-stream.js";
import type { NotificationItem, NotificationPage } from "./types.js";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  subscribe: vi.fn(),
}));

vi.mock("../notifications-api.js", () => ({
  listNotifications: mocks.list,
  markNotificationRead: mocks.markRead,
  markAllNotificationsRead: mocks.markAllRead,
}));

vi.mock("../subscribe-to-notification-stream.js", () => ({
  subscribeToNotificationStream: mocks.subscribe,
}));

const notice = (id: string, readAt: string | null = null): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: {},
  createdAt: "2026-11-19T09:00:00Z",
  readAt,
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

const streamOptions = () =>
  mocks.subscribe.mock.calls[0]?.[0] as Parameters<typeof subscribeToNotificationStream>[0];

const renderInbox = async (page: NotificationPage) => {
  mocks.list.mockResolvedValueOnce(page);
  const rendered = renderHook(() => useNotificationsInbox());
  await waitFor(() => expect(rendered.result.current.status).toBe("ready"));
  return rendered;
};

describe("useNotificationsInbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.subscribe.mockResolvedValue(undefined);
    mocks.markRead.mockResolvedValue(undefined);
    mocks.markAllRead.mockResolvedValue({ updated: 0 });
    mocks.list.mockResolvedValue(pageOf([]));
  });

  it("loads the first page with the default filters on mount", async () => {
    const { result } = await renderInbox(pageOf([notice("a")]));

    expect(mocks.list).toHaveBeenCalledWith({ limit: 20 });
    expect(result.current.items.map((item) => item.id)).toEqual(["a"]);
  });

  it("puts a live notice at the top and bumps the unread count", async () => {
    const { result } = await renderInbox(pageOf([notice("a")]));

    act(() => streamOptions().onNotification(notice("live")));

    expect(result.current.items.map((item) => item.id)).toEqual(["live", "a"]);
    expect(result.current.unreadCount).toBe(2);
  });

  it("marks one notice read and reverts it with an error when the request fails", async () => {
    mocks.markRead.mockRejectedValueOnce(new Error("offline"));
    const { result } = await renderInbox(pageOf([notice("a")]));

    await act(() => result.current.markRead("a"));

    expect(mocks.markRead).toHaveBeenCalledWith("a");
    expect(result.current.items[0]?.readAt).toBeNull();
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.errorKind).toBe("markRead");
  });

  it("marks all notices read and reloads the first page when the request fails", async () => {
    mocks.markAllRead.mockRejectedValueOnce(new Error("offline"));
    const { result } = await renderInbox(pageOf([notice("a")]));

    await act(() => result.current.markAllRead());

    expect(mocks.markAllRead).toHaveBeenCalledTimes(1);
    expect(mocks.list).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.status).toBe("ready"));
  });

  it("reloads the first page when the stream asks for a reset", async () => {
    await renderInbox(pageOf([notice("a")]));

    act(() => streamOptions().onReset());

    await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(2));
  });

  it("reloads the first page with the new filters when they change", async () => {
    const { result } = await renderInbox(pageOf([notice("a")]));

    act(() => result.current.setFilters({ unread: true }));

    await waitFor(() => expect(mocks.list).toHaveBeenLastCalledWith({ limit: 20, unread: "true" }));
  });

  it("appends the next page when loading more", async () => {
    const { result } = await renderInbox(pageOf([notice("a")], { nextCursor: "cursor-1" }));
    mocks.list.mockResolvedValueOnce(pageOf([notice("b")]));

    await act(() => result.current.loadMore());

    expect(mocks.list).toHaveBeenLastCalledWith({ limit: 20, cursor: "cursor-1" });
    expect(result.current.items.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("surfaces a stream error as state", async () => {
    const { result } = await renderInbox(pageOf([notice("a")]));

    act(() => streamOptions().onError(new Error("stream down")));

    expect(result.current.errorKind).toBe("stream");
    expect(result.current.status).toBe("ready");
  });

  it("aborts the stream when unmounted", async () => {
    const { unmount } = await renderInbox(pageOf([]));
    const { signal } = streamOptions();

    unmount();

    expect(signal.aborted).toBe(true);
  });
});
