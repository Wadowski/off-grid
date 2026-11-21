// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createInitialInboxState } from "./create-initial-inbox-state.js";
import { inboxReducer } from "./inbox-reducer.js";
import type { InboxState, NotificationItem, NotificationPage } from "./types.js";

const READ_AT = "2026-11-19T10:00:00Z";

const notice = (id: string, readAt: string | null = null): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: {},
  createdAt: "2026-11-19T09:00:00Z",
  readAt,
});

const page = (notifications: NotificationItem[]): NotificationPage => ({
  notifications,
  unreadCount: 1,
  nextCursor: "cursor-1",
  total: notifications.length,
});

const initial = createInitialInboxState({});

const loadedState = (): InboxState =>
  inboxReducer(initial, { type: "pageLoaded", page: page([notice("a"), notice("b", READ_AT)]) });

describe("inboxReducer", () => {
  it("moves to loading when a load starts and to error when a load fails", () => {
    const loading = inboxReducer(loadedState(), { type: "loadStarted" });
    const failed = inboxReducer(loading, { type: "loadFailed" });

    expect(loading.status).toBe("loading");
    expect(failed.status).toBe("error");
    expect(failed.errorKind).toBe("load");
  });

  it("replaces items with the loaded page and sets status to ready", () => {
    const state = loadedState();

    expect(state.items.map((item) => item.id)).toEqual(["a", "b"]);
    expect(state.status).toBe("ready");
    expect(state.nextCursor).toBe("cursor-1");
  });

  it("clears items and stores the new filters when filters change", () => {
    const state = inboxReducer(loadedState(), {
      type: "filtersChanged",
      filters: { unread: true },
    });

    expect(state.items).toEqual([]);
    expect(state.filters).toEqual({ unread: true });
  });

  it("clears a previous error when filters change", () => {
    const failed = inboxReducer(loadedState(), { type: "loadMoreFailed" });

    const state = inboxReducer(failed, { type: "filtersChanged", filters: { unread: true } });

    expect(state.errorKind).toBeUndefined();
  });

  it("appends a loaded page after the current items", () => {
    const state = inboxReducer(loadedState(), { type: "moreLoaded", page: page([notice("c")]) });

    expect(state.items.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("routes a live notice to the top of the list", () => {
    const state = inboxReducer(loadedState(), {
      type: "liveNotificationReceived",
      notification: notice("live"),
    });

    expect(state.items.map((item) => item.id)).toEqual(["live", "a", "b"]);
    expect(state.unreadCount).toBe(2);
  });

  it("marks one item read optimistically and reverts it on failure", () => {
    const read = inboxReducer(loadedState(), {
      type: "markReadRequested",
      notificationId: "a",
      readAt: READ_AT,
    });
    const reverted = inboxReducer(read, {
      type: "markReadReverted",
      notificationId: "a",
      previousReadAt: null,
    });

    expect(read.items[0]?.readAt).toBe(READ_AT);
    expect(read.unreadCount).toBe(0);
    expect(reverted.items[0]?.readAt).toBeNull();
    expect(reverted.unreadCount).toBe(1);
    expect(reverted.errorKind).toBe("markRead");
  });

  it("marks every item read and records a mark-all error", () => {
    const read = inboxReducer(loadedState(), { type: "markAllReadRequested", readAt: READ_AT });
    const failed = inboxReducer(read, { type: "markAllReadFailed" });

    expect(read.items.every((item) => item.readAt !== null)).toBe(true);
    expect(read.unreadCount).toBe(0);
    expect(failed.errorKind).toBe("markAllRead");
  });

  it("records load-more and stream errors without changing the list", () => {
    const loadMoreFailed = inboxReducer(loadedState(), { type: "loadMoreFailed" });
    const streamFailed = inboxReducer(loadedState(), { type: "streamFailed" });

    expect(loadMoreFailed.errorKind).toBe("loadMore");
    expect(loadMoreFailed.items).toHaveLength(2);
    expect(streamFailed.errorKind).toBe("stream");
    expect(streamFailed.status).toBe("ready");
  });
});
