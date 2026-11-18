// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NOTIFICATION_TYPES, notificationCategorySchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { NOTIFICATION_CATEGORY_BY_TYPE } from "./constants.js";

describe("NOTIFICATION_CATEGORY_BY_TYPE", () => {
  it.each(NOTIFICATION_TYPES.map((type) => [type]))("gives %s one known category", (type) => {
    expect(notificationCategorySchema.options).toContain(NOTIFICATION_CATEGORY_BY_TYPE[type]);
  });

  it("maps each type to its category", () => {
    expect(NOTIFICATION_CATEGORY_BY_TYPE).toEqual({
      "password-changed": "account-security",
      "recovery-code-regenerated": "account-security",
      "event-invited": "calendar",
      "event-reminder": "calendar",
    });
  });
});
