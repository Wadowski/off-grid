// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { notificationMarkAllReadSchema } from "./notification-mark-all-read-schema.js";

describe("notificationMarkAllReadSchema", () => {
  it("accepts a count of zero and a positive count", () => {
    expect(notificationMarkAllReadSchema.parse({ updated: 0 })).toEqual({ updated: 0 });
    expect(notificationMarkAllReadSchema.parse({ updated: 3 })).toEqual({ updated: 3 });
  });

  it("rejects a negative, fractional or missing count", () => {
    expect(notificationMarkAllReadSchema.safeParse({ updated: -1 }).success).toBe(false);
    expect(notificationMarkAllReadSchema.safeParse({ updated: 1.5 }).success).toBe(false);
    expect(notificationMarkAllReadSchema.safeParse({}).success).toBe(false);
  });
});
