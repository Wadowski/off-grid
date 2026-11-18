// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPES } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { typesInCategory } from "./types-in-category.js";

describe("typesInCategory", () => {
  it("lists the calendar types", () => {
    expect(typesInCategory("calendar")).toEqual(["event-invited", "event-reminder"]);
  });

  it("lists the account-security types", () => {
    expect(typesInCategory("account-security")).toEqual([
      "password-changed",
      "recovery-code-regenerated",
    ]);
  });

  it("partitions every notification type into exactly one category", () => {
    const listed = NOTIFICATION_CATEGORIES.flatMap((category) => typesInCategory(category));

    expect([...listed].sort()).toEqual([...NOTIFICATION_TYPES].sort());
  });
});
