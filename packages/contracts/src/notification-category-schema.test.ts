// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { notificationCategorySchema } from "./notification-category-schema.js";

describe("notificationCategorySchema", () => {
  it.each(["calendar", "account-security"])("accepts %s", (category) => {
    expect(notificationCategorySchema.parse(category)).toBe(category);
  });

  it.each(["Calendar", "family", "", "password-changed"])("rejects %s", (category) => {
    expect(notificationCategorySchema.safeParse(category).success).toBe(false);
  });
});
