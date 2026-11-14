// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { zonedLocalToInstant } from "./zoned-local-to-instant.js";

const iso = (date: string, time: string, timeZone: string): string | undefined =>
  zonedLocalToInstant(date, time, timeZone)?.toISOString();

describe("zonedLocalToInstant", () => {
  it("uses the summer offset in Europe/Warsaw", () => {
    expect(iso("2026-07-01", "12:00", "Europe/Warsaw")).toBe("2026-07-01T10:00:00.000Z");
  });

  it("uses the winter offset in Europe/Warsaw", () => {
    expect(iso("2026-12-01", "12:00", "Europe/Warsaw")).toBe("2026-12-01T11:00:00.000Z");
  });

  it("uses the offset before the spring daylight-saving switch on the switch day", () => {
    expect(iso("2026-03-29", "01:30", "Europe/Warsaw")).toBe("2026-03-29T00:30:00.000Z");
  });

  it("uses the offset after the spring daylight-saving switch on the switch day", () => {
    expect(iso("2026-03-29", "03:30", "Europe/Warsaw")).toBe("2026-03-29T01:30:00.000Z");
  });

  it("handles a zone with a half-hour offset", () => {
    expect(iso("2026-11-20", "00:00", "Asia/Kolkata")).toBe("2026-11-19T18:30:00.000Z");
  });

  it("accepts 29 February in a leap year and refuses it in a common year", () => {
    expect(iso("2028-02-29", "12:00", "UTC")).toBe("2028-02-29T12:00:00.000Z");
    expect(iso("2026-02-29", "12:00", "UTC")).toBeUndefined();
  });

  it("refuses a malformed or impossible date and time", () => {
    expect(iso("", "12:00", "Europe/Warsaw")).toBeUndefined();
    expect(iso("2026-07-01", "", "Europe/Warsaw")).toBeUndefined();
    expect(iso("2026-7-1", "12:00", "Europe/Warsaw")).toBeUndefined();
    expect(iso("2026-13-01", "12:00", "Europe/Warsaw")).toBeUndefined();
    expect(iso("2026-04-31", "12:00", "Europe/Warsaw")).toBeUndefined();
    expect(iso("2026-07-01", "24:00", "Europe/Warsaw")).toBeUndefined();
    expect(iso("2026-07-01", "12:60", "Europe/Warsaw")).toBeUndefined();
    expect(iso("2026-07-01T12:00", "12:00", "Europe/Warsaw")).toBeUndefined();
  });
});
