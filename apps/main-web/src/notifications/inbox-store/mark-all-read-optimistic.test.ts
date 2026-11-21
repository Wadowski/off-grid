// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createInitialInboxState } from "./create-initial-inbox-state.js";
import { markAllReadOptimistic } from "./mark-all-read-optimistic.js";
import type { NotificationItem } from "./types.js";

const READ_AT = "2026-11-19T10:00:00Z";
const EARLIER_READ_AT = "2026-11-18T08:00:00Z";

const notice = (id: string, readAt: string | null): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: {},
  createdAt: "2026-11-19T09:00:00Z",
  readAt,
});

describe("markAllReadOptimistic", () => {
  it("sets readAt on every unread item, keeps earlier readAt values, and zeroes the count", () => {
    const state = markAllReadOptimistic(
      {
        ...createInitialInboxState({}),
        items: [notice("a", null), notice("b", EARLIER_READ_AT)],
        unreadCount: 1,
        status: "ready",
      },
      READ_AT,
    );

    expect(state.items.map((item) => item.readAt)).toEqual([READ_AT, EARLIER_READ_AT]);
    expect(state.unreadCount).toBe(0);
  });
});
