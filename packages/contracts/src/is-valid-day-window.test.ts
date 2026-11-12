// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isValidDayWindow } from "./is-valid-day-window.js";

describe("isValidDayWindow", () => {
  it("refuses an end date before the start date", () => {
    expect(isValidDayWindow({ startDate: "2026-11-21", endDate: "2026-11-20" })).toBe(false);
  });

  it("allows a single day and a longer window", () => {
    expect(isValidDayWindow({ startDate: "2026-11-20", endDate: "2026-11-20" })).toBe(true);
    expect(isValidDayWindow({ startDate: "2026-11-20", endDate: "2026-11-22" })).toBe(true);
  });
});
