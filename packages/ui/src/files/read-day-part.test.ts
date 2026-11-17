// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { readDayPart } from "./read-day-part.js";

describe("readDayPart", () => {
  const parts: Intl.DateTimeFormatPart[] = [
    { type: "month", value: "3" },
    { type: "day", value: "14" },
  ];

  it("reads the numeric value of the named part", () => {
    expect(readDayPart(parts, "day")).toBe(14);
  });

  it("returns NaN for a missing part", () => {
    expect(readDayPart(parts, "year")).toBeNaN();
  });
});
