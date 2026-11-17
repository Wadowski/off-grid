// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { formatFileDate } from "./format-file-date.js";

const NOW = new Date("2026-11-17T12:00:00Z");

describe("formatFileDate", () => {
  it("shows the time for a change made today", () => {
    expect(formatFileDate(new Date("2026-11-17T09:05:00Z"), NOW, "en", "UTC")).toEqual({
      kind: "today",
      time: "09:05 AM",
    });
  });

  it("writes the time the way the locale does", () => {
    expect(formatFileDate(new Date("2026-11-17T14:22:00Z"), NOW, "pl", "UTC")).toEqual({
      kind: "today",
      time: "14:22",
    });
  });

  it("says yesterday for a change made the day before", () => {
    expect(formatFileDate(new Date("2026-11-16T23:59:00Z"), NOW, "en", "UTC")).toEqual({
      kind: "yesterday",
    });
  });

  it("shows the month and day for a change earlier in the same year", () => {
    expect(formatFileDate(new Date("2026-10-18T10:00:00Z"), NOW, "en", "UTC")).toEqual({
      kind: "date",
      text: "Oct 18",
    });
  });

  it("adds the year for a change made in another year", () => {
    expect(formatFileDate(new Date("2025-12-31T10:00:00Z"), NOW, "en", "UTC")).toEqual({
      kind: "date",
      text: "Dec 31, 2025",
    });
  });

  it("counts days in the given time zone around midnight", () => {
    const justAfterMidnight = new Date("2026-11-17T00:30:00Z");
    expect(formatFileDate(justAfterMidnight, NOW, "en", "UTC").kind).toBe("today");
    expect(formatFileDate(justAfterMidnight, NOW, "en", "America/Los_Angeles").kind).toBe(
      "yesterday",
    );
  });

  it("follows the locale for the month name", () => {
    expect(formatFileDate(new Date("2026-10-18T10:00:00Z"), NOW, "pl", "UTC")).toEqual({
      kind: "date",
      text: "18 paź",
    });
  });

  it("shows a date for a change in the future", () => {
    expect(formatFileDate(new Date("2026-11-20T10:00:00Z"), NOW, "en", "UTC").kind).toBe("date");
  });

  it("crosses a month boundary when counting yesterday", () => {
    const firstOfMonth = new Date("2026-12-01T10:00:00Z");
    expect(formatFileDate(new Date("2026-11-30T10:00:00Z"), firstOfMonth, "en", "UTC").kind).toBe(
      "yesterday",
    );
  });
});
