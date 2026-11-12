// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { validateCalendarName } from "./validate-calendar-name.js";

describe("validateCalendarName", () => {
  it("accepts a name within the contract limits", () => {
    expect(validateCalendarName("Studio")).toBeUndefined();
  });

  it("requires a name that is not blank", () => {
    expect(validateCalendarName("")).toBe("calendar.errors.nameRequired");
    expect(validateCalendarName("   ")).toBe("calendar.errors.nameRequired");
  });

  it("rejects names longer than the contract maximum of 100 characters", () => {
    expect(validateCalendarName("a".repeat(101))).toBe("calendar.errors.nameRequired");
  });
});
