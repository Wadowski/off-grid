// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { applyMoreLoaded } from "./apply-more-loaded.js";
import { createInitialInboxState } from "./create-initial-inbox-state.js";
import type { InboxState, NotificationItem, NotificationPage } from "./types.js";

const item = (id: string): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: {},
  createdAt: "2026-11-19T09:00:00Z",
  readAt: null,
});

const pageOf = (
  notifications: NotificationItem[],
  nextCursor: string | null,
): NotificationPage => ({ notifications, unreadCount: 5, nextCursor, total: 9 });

const stateWith = (items: readonly NotificationItem[]): InboxState => ({
  ...createInitialInboxState({}),
  items,
  nextCursor: "cursor-1",
  unreadCount: 3,
  status: "ready",
});

describe("applyMoreLoaded", () => {
  it("appends older items after the loaded ones and moves the cursor on", () => {
    const state = applyMoreLoaded(stateWith([item("a")]), pageOf([item("b")], "cursor-2"));

    expect(state.items.map((notification) => notification.id)).toEqual(["a", "b"]);
    expect(state.nextCursor).toBe("cursor-2");
  });

  it("skips items that are already loaded", () => {
    const state = applyMoreLoaded(
      stateWith([item("a"), item("b")]),
      pageOf([item("b"), item("c")], null),
    );

    expect(state.items.map((notification) => notification.id)).toEqual(["a", "b", "c"]);
    expect(state.nextCursor).toBeNull();
  });

  it("keeps the unread count it already has", () => {
    const state = applyMoreLoaded(stateWith([item("a")]), pageOf([item("b")], null));

    expect(state.unreadCount).toBe(3);
  });

  it("clears a previous loadMore error once a page loads", () => {
    const failed = { ...stateWith([item("a")]), errorKind: "loadMore" as const };

    const state = applyMoreLoaded(failed, pageOf([item("b")], null));

    expect(state.errorKind).toBeUndefined();
    expect(state.items.map((notification) => notification.id)).toEqual(["a", "b"]);
  });

  it("keeps an error from another action", () => {
    const failed = { ...stateWith([item("a")]), errorKind: "markRead" as const };

    const state = applyMoreLoaded(failed, pageOf([item("b")], null));

    expect(state.errorKind).toBe("markRead");
  });
});
