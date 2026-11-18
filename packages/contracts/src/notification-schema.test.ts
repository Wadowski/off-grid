// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { notificationListSchema } from "./notification-schema.js";

const NOTIFICATION_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f";

const item = {
  id: NOTIFICATION_ID,
  type: "password-changed",
  category: "account-security",
  data: {},
  createdAt: "2026-11-01T10:00:00.000Z",
  readAt: null,
};

describe("notificationListSchema", () => {
  it("accepts a last page with a null next cursor", () => {
    const list = { notifications: [item], unreadCount: 1, nextCursor: null, total: 1 };

    expect(notificationListSchema.parse(list)).toEqual(list);
  });

  it("accepts a page that has a next cursor", () => {
    const list = { notifications: [item], unreadCount: 1, nextCursor: "abc", total: 3 };

    expect(notificationListSchema.safeParse(list).success).toBe(true);
  });

  it("rejects a notice without a category", () => {
    const withoutCategory = {
      id: item.id,
      type: item.type,
      data: item.data,
      createdAt: item.createdAt,
      readAt: item.readAt,
    };
    const list = { notifications: [withoutCategory], unreadCount: 1, nextCursor: null, total: 1 };

    expect(notificationListSchema.safeParse(list).success).toBe(false);
  });

  it("rejects a list without a total", () => {
    const list = { notifications: [item], unreadCount: 1, nextCursor: null };

    expect(notificationListSchema.safeParse(list).success).toBe(false);
  });
});
