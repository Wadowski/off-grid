// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { encodeNotificationCursor } from "./encode-notification-cursor.js";

describe("encodeNotificationCursor", () => {
  it("writes an opaque base64url value with no plain id or date in it", () => {
    const value = encodeNotificationCursor({
      createdAt: new Date("2026-11-01T10:00:00.000Z"),
      notificationId: "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f",
    });

    expect(value).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(value).not.toContain("2026-11-01");
  });
});
