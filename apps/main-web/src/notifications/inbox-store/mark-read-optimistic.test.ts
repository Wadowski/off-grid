// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createInitialInboxState } from "./create-initial-inbox-state.js";
import { markReadOptimistic } from "./mark-read-optimistic.js";
import type { InboxState, NotificationItem } from "./types.js";

const READ_AT = "2026-11-19T10:00:00Z";
const EARLIER_READ_AT = "2026-11-18T08:00:00Z";

const notice = (id: string, readAt: string | null = null): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: {},
  createdAt: "2026-11-19T09:00:00Z",
  readAt,
});

const stateWith = (items: readonly NotificationItem[], unreadCount: number): InboxState => ({
  ...createInitialInboxState({}),
  items,
  unreadCount,
  status: "ready",
});

describe("markReadOptimistic", () => {
  it("sets readAt on the item and decrements the unread count once", () => {
    const state = markReadOptimistic(stateWith([notice("a"), notice("b")], 2), "a", READ_AT);

    expect(state.items.map((item) => item.readAt)).toEqual([READ_AT, null]);
    expect(state.unreadCount).toBe(1);
  });

  it("keeps an already set readAt and does not change the count", () => {
    const current = stateWith([notice("a", EARLIER_READ_AT)], 0);

    const state = markReadOptimistic(current, "a", READ_AT);

    expect(state).toBe(current);
  });

  it("leaves state unchanged for an unknown id", () => {
    const current = stateWith([notice("a")], 1);

    expect(markReadOptimistic(current, "missing", READ_AT)).toBe(current);
  });

  it("never lets the unread count go below zero", () => {
    const state = markReadOptimistic(stateWith([notice("a")], 0), "a", READ_AT);

    expect(state.unreadCount).toBe(0);
  });
});
