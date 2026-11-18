// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { notificationListQuerySchema } from "./notification-list-query-schema.js";

describe("notificationListQuerySchema", () => {
  it("defaults the limit to 20 and leaves the cursor out", () => {
    expect(notificationListQuerySchema.parse({})).toEqual({ limit: 20 });
  });

  it("reads a numeric limit from a query string", () => {
    expect(notificationListQuerySchema.parse({ limit: "50" })).toEqual({ limit: 50 });
  });

  it("accepts a cursor", () => {
    expect(notificationListQuerySchema.parse({ cursor: "abc" })).toEqual({
      cursor: "abc",
      limit: 20,
    });
  });

  it.each([{ limit: "0" }, { limit: "51" }, { limit: "2.5" }, { limit: "ten" }, { cursor: "" }])(
    "rejects %o",
    (query) => {
      expect(notificationListQuerySchema.safeParse(query).success).toBe(false);
    },
  );

  it.each(["calendar", "account-security"])("accepts the %s category", (category) => {
    expect(notificationListQuerySchema.parse({ category })).toEqual({ category, limit: 20 });
  });

  it("accepts unread=true", () => {
    expect(notificationListQuerySchema.parse({ unread: "true" })).toEqual({
      unread: "true",
      limit: 20,
    });
  });

  it.each([{ category: "family" }, { unread: "false" }, { unread: "1" }, { unread: true }])(
    "rejects %o",
    (query) => {
      expect(notificationListQuerySchema.safeParse(query).success).toBe(false);
    },
  );

  it("accepts a category together with unread=true", () => {
    expect(notificationListQuerySchema.parse({ category: "calendar", unread: "true" })).toEqual({
      category: "calendar",
      unread: "true",
      limit: 20,
    });
  });

  it("rejects a cursor longer than 512 characters", () => {
    expect(notificationListQuerySchema.safeParse({ cursor: "x".repeat(513) }).success).toBe(false);
  });
});
