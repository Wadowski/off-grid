// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { hasItemWithId } from "./has-item-with-id.js";
import type { NotificationItem } from "./types.js";

const notice = (id: string): NotificationItem => ({
  id,
  type: "event-reminder",
  category: "calendar",
  data: {},
  createdAt: "2026-11-19T09:00:00Z",
  readAt: null,
});

describe("hasItemWithId", () => {
  it("is true when an item with the id is in the list", () => {
    expect(hasItemWithId([notice("a"), notice("b")], "b")).toBe(true);
  });

  it("is false when no item has the id", () => {
    expect(hasItemWithId([notice("a")], "missing")).toBe(false);
  });

  it("is false for an empty list", () => {
    expect(hasItemWithId([], "a")).toBe(false);
  });
});
