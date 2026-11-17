// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toUtcDay } from "./to-utc-day.js";

describe("toUtcDay", () => {
  it("returns the UTC milliseconds of the calendar day", () => {
    expect(toUtcDay({ year: 1970, month: 1, day: 2 })).toBe(86_400_000);
  });
});
