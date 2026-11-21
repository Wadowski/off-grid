// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createInitialInboxState } from "./create-initial-inbox-state.js";
import { markReadOptimistic } from "./mark-read-optimistic.js";
import { revertRead } from "./revert-read.js";
import type { InboxState, NotificationItem } from "./types.js";

const READ_AT = "2026-11-19T10:00:00Z";

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

describe("revertRead", () => {
  it("restores the previous readAt and the unread count after an optimistic read", () => {
    const optimistic = markReadOptimistic(stateWith([notice("a")], 1), "a", READ_AT);

    const state = revertRead(optimistic, "a", null);

    expect(state.items[0]?.readAt).toBeNull();
    expect(state.unreadCount).toBe(1);
    expect(state.errorKind).toBe("markRead");
  });

  it("restores only the error when the item was already read before the attempt", () => {
    const read = stateWith([notice("a", READ_AT)], 0);

    const state = revertRead(read, "a", READ_AT);

    expect(state.items[0]?.readAt).toBe(READ_AT);
    expect(state.unreadCount).toBe(0);
    expect(state.errorKind).toBe("markRead");
  });

  it("sets the error without touching items when the item is no longer loaded", () => {
    const state = revertRead(stateWith([notice("a")], 1), "missing", null);

    expect(state.items.map((item) => item.id)).toEqual(["a"]);
    expect(state.unreadCount).toBe(1);
    expect(state.errorKind).toBe("markRead");
  });
});
