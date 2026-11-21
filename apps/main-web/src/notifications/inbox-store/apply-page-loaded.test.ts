// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { applyPageLoaded } from "./apply-page-loaded.js";
import { createInitialInboxState } from "./create-initial-inbox-state.js";
import type { NotificationItem, NotificationPage } from "./types.js";

const item = (id: string, createdAt: string, readAt: string | null = null): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: {},
  createdAt,
  readAt,
});

const pageOf = (
  notifications: NotificationItem[],
  overrides: Partial<NotificationPage> = {},
): NotificationPage => ({
  notifications,
  unreadCount: 2,
  nextCursor: "cursor-1",
  total: notifications.length,
  ...overrides,
});

const loadingState = createInitialInboxState({});

describe("applyPageLoaded", () => {
  it("replaces items with the page and takes cursor and unread count from the server", () => {
    const page = pageOf([item("a", "2026-11-19T09:00:00Z"), item("b", "2026-11-18T09:00:00Z")]);

    const state = applyPageLoaded(loadingState, page);

    expect(state.items.map((notification) => notification.id)).toEqual(["a", "b"]);
    expect(state.nextCursor).toBe("cursor-1");
    expect(state.unreadCount).toBe(2);
    expect(state.status).toBe("ready");
  });

  it("keeps live items that are newer than the page head and not in the page", () => {
    const live = item("live", "2026-11-19T12:00:00Z");
    const stale = { ...loadingState, items: [live, item("old", "2026-11-01T00:00:00Z")] };
    const page = pageOf([item("a", "2026-11-19T09:00:00Z")]);

    const state = applyPageLoaded(stale, page);

    expect(state.items.map((notification) => notification.id)).toEqual(["live", "a"]);
  });

  it("compares createdAt as instants, so a later local time with an earlier instant is not kept", () => {
    const live = item("live", "2026-11-19T10:00:00+02:00");
    const state = applyPageLoaded(
      { ...loadingState, items: [live] },
      pageOf([item("a", "2026-11-19T09:00:00Z")]),
    );

    expect(state.items.map((notification) => notification.id)).toEqual(["a"]);
  });

  it("drops a live item that the page already contains, without duplicating it", () => {
    const shared = item("a", "2026-11-19T09:00:00Z");
    const state = applyPageLoaded({ ...loadingState, items: [shared] }, pageOf([shared]));

    expect(state.items.map((notification) => notification.id)).toEqual(["a"]);
  });

  it("clears a previous error once the page loads", () => {
    const failed = { ...loadingState, status: "error" as const, errorKind: "load" as const };

    const state = applyPageLoaded(failed, pageOf([]));

    expect(state.status).toBe("ready");
    expect(state.errorKind).toBeUndefined();
  });

  it("takes the API total for the current filter", () => {
    const state = applyPageLoaded(
      loadingState,
      pageOf([item("a", "2026-11-19T09:00:00Z")], { total: 42 }),
    );

    expect(state.total).toBe(42);
  });
});
