// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "./format-relative-time.js";

const WARSAW = "Europe/Warsaw";
const LOS_ANGELES = "America/Los_Angeles";
const NOW = new Date("2026-11-19T11:00:00Z");

const minutesBefore = (minutes: number): string =>
  new Date(NOW.getTime() - minutes * 60_000).toISOString();

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads under a minute as just now", () => {
    expect(formatRelativeTime(NOW, NOW.toISOString(), WARSAW)).toEqual({
      textId: "notifications.time.justNow",
    });
    expect(formatRelativeTime(NOW, new Date(NOW.getTime() - 59_000).toISOString(), WARSAW)).toEqual({
      textId: "notifications.time.justNow",
    });
  });

  it("reads a future timestamp as just now", () => {
    expect(formatRelativeTime(NOW, new Date(NOW.getTime() + 300_000).toISOString(), WARSAW)).toEqual(
      { textId: "notifications.time.justNow" },
    );
  });

  it("counts whole minutes from one minute up to an hour", () => {
    expect(formatRelativeTime(NOW, new Date(NOW.getTime() - 60_000).toISOString(), WARSAW)).toEqual({
      textId: "notifications.time.minutesAgo",
      values: { count: 1 },
    });
    expect(formatRelativeTime(NOW, new Date(NOW.getTime() - 3_599_000).toISOString(), WARSAW)).toEqual({
      textId: "notifications.time.minutesAgo",
      values: { count: 59 },
    });
    expect(formatRelativeTime(NOW, minutesBefore(60), WARSAW)).toEqual({
      textId: "notifications.time.hoursAgo",
      values: { count: 1 },
    });
  });

  it("counts whole hours up to 23 hours 59 minutes", () => {
    expect(formatRelativeTime(NOW, minutesBefore(23 * 60 + 59), WARSAW)).toEqual({
      textId: "notifications.time.hoursAgo",
      values: { count: 23 },
    });
  });

  it("reads 24 hours exactly as yesterday with the time", () => {
    const item = new Date("2026-11-18T12:00:00Z").toISOString();
    expect(formatRelativeTime(new Date("2026-11-19T12:00:00Z"), item, WARSAW)).toEqual({
      textId: "notifications.time.yesterdayAt",
      values: { time: "13:00" },
    });
  });

  it("reads an item from yesterday seen 26 hours later as Yesterday with the time", () => {
    const item = new Date("2026-11-18T15:42:00Z");
    expect(formatRelativeTime(new Date(item.getTime() + 26 * 3_600_000), item.toISOString(), WARSAW)).toEqual({
      textId: "notifications.time.yesterdayAt",
      values: { time: "16:42" },
    });
  });

  it("reads an older item as day, short month and 24 hour time", () => {
    const item = new Date("2026-11-10T09:05:00Z").toISOString();
    expect(formatRelativeTime(NOW, item, WARSAW)).toEqual({
      textId: "notifications.time.dateAt",
      values: { date: "10 Nov", time: "10:05" },
    });
  });

  it("adds the year when the item is from another year", () => {
    const item = new Date("2025-12-30T10:00:00Z").toISOString();
    expect(formatRelativeTime(NOW, item, WARSAW)).toEqual({
      textId: "notifications.time.dateWithYearAt",
      values: { date: "30 Dec 2025", time: "11:00" },
    });
  });

  it("uses the given zone for the same instant", () => {
    const item = new Date("2026-11-18T15:42:00Z").toISOString();
    const now = new Date("2026-11-19T17:42:00Z");
    expect(formatRelativeTime(now, item, WARSAW)).toEqual({
      textId: "notifications.time.yesterdayAt",
      values: { time: "16:42" },
    });
    expect(formatRelativeTime(now, item, LOS_ANGELES)).toEqual({
      textId: "notifications.time.yesterdayAt",
      values: { time: "07:42" },
    });
  });

  it("uses the browser time zone when no zone is given", () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      timeZone: LOS_ANGELES,
    } as Intl.ResolvedDateTimeFormatOptions);
    const item = new Date("2026-11-18T15:42:00Z").toISOString();
    expect(formatRelativeTime(new Date("2026-11-19T17:42:00Z"), item)).toEqual({
      textId: "notifications.time.yesterdayAt",
      values: { time: "07:42" },
    });
  });
});
