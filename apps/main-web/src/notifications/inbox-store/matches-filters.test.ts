// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { matchesFilters } from "./matches-filters.js";
import type { NotificationItem } from "./types.js";

const calendarUnread: NotificationItem = {
  id: "a",
  type: "event-invited",
  category: "calendar",
  data: {},
  createdAt: "2026-11-19T09:00:00Z",
  readAt: null,
};
const securityRead: NotificationItem = {
  ...calendarUnread,
  id: "b",
  type: "password-changed",
  category: "account-security",
  readAt: "2026-11-19T10:00:00Z",
};

describe("matchesFilters", () => {
  it("matches everything when no filter is set", () => {
    expect(matchesFilters({}, calendarUnread)).toBe(true);
    expect(matchesFilters({}, securityRead)).toBe(true);
  });

  it("matches only the given category", () => {
    expect(matchesFilters({ category: "calendar" }, calendarUnread)).toBe(true);
    expect(matchesFilters({ category: "calendar" }, securityRead)).toBe(false);
  });

  it("matches only unread notices when the unread filter is on", () => {
    expect(matchesFilters({ unread: true }, calendarUnread)).toBe(true);
    expect(matchesFilters({ unread: true }, securityRead)).toBe(false);
  });

  it("requires both filters to match when both are set", () => {
    expect(matchesFilters({ category: "calendar", unread: true }, calendarUnread)).toBe(true);
    expect(matchesFilters({ category: "account-security", unread: true }, calendarUnread)).toBe(
      false,
    );
    expect(matchesFilters({ category: "calendar", unread: true }, securityRead)).toBe(false);
  });
});
