// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { calendarColorSchema, calendarNameSchema } from "./calendar-schemas.js";

describe("calendarNameSchema", () => {
  it("trims a name and keeps it", () => {
    expect(calendarNameSchema.parse("  Kitchen ")).toBe("Kitchen");
  });

  it("refuses a name longer than 100 characters", () => {
    expect(() => calendarNameSchema.parse("a".repeat(101))).toThrow();
  });
});

describe("calendarColorSchema", () => {
  it("accepts a palette color", () => {
    expect(calendarColorSchema.parse("rose")).toBe("rose");
  });

  it("refuses a color outside the palette", () => {
    expect(() => calendarColorSchema.parse("#ff0000")).toThrow();
  });
});
