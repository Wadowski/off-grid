// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createInitialInboxState } from "./create-initial-inbox-state.js";
import { mergeLiveNotification } from "./merge-live-notification.js";
import type { InboxFilters, InboxState, NotificationItem } from "./types.js";

const notice = (
  id: string,
  overrides: Partial<NotificationItem> = {},
): NotificationItem => ({
  id,
  type: "event-invited",
  category: "calendar",
  data: {},
  createdAt: "2026-11-19T09:00:00Z",
  readAt: null,
  ...overrides,
});

const stateWith = (
  items: readonly NotificationItem[],
  filters: InboxFilters = {},
  unreadCount = 1,
): InboxState => ({
  ...createInitialInboxState(filters),
  items,
  unreadCount,
  status: "ready",
});

describe("mergeLiveNotification", () => {
  it("inserts a new notice at the top and bumps the unread count", () => {
    const state = mergeLiveNotification(stateWith([notice("a")]), notice("b"));

    expect(state.items.map((item) => item.id)).toEqual(["b", "a"]);
    expect(state.unreadCount).toBe(2);
  });

  it("ignores a notice that is already loaded, without duplicating it or bumping the count", () => {
    const current = stateWith([notice("a")]);

    const state = mergeLiveNotification(current, notice("a"));

    expect(state).toBe(current);
  });

  it("does not bump the unread count for a notice that arrives already read", () => {
    const state = mergeLiveNotification(
      stateWith([notice("a")]),
      notice("b", { readAt: "2026-11-19T09:05:00Z" }),
    );

    expect(state.items.map((item) => item.id)).toEqual(["b", "a"]);
    expect(state.unreadCount).toBe(1);
  });

  it("leaves items unchanged when the notice does not match the category filter", () => {
    const state = mergeLiveNotification(
      stateWith([notice("a")], { category: "calendar" }),
      notice("b", { category: "account-security" }),
    );

    expect(state.items.map((item) => item.id)).toEqual(["a"]);
    expect(state.unreadCount).toBe(2);
  });

  it("leaves items unchanged for a read notice when the unread filter is on", () => {
    const state = mergeLiveNotification(
      stateWith([notice("a")], { unread: true }),
      notice("b", { readAt: "2026-11-19T09:05:00Z" }),
    );

    expect(state.items.map((item) => item.id)).toEqual(["a"]);
    expect(state.unreadCount).toBe(1);
  });
});
