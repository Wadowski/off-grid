// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { layoutTimedEvents, MINUTES_PER_DAY, nowMinutesOnDate } from "./timeline-layout.js";

type Event = { id: string; startsAt: string; endsAt: string };

const event = (id: string, startsAt: string, endsAt: string): Event => ({ id, startsAt, endsAt });

describe("timeline layout", () => {
  it("places a block by its start time and duration in the caller's zone", () => {
    const [block] = layoutTimedEvents(
      [event("a", "2025-10-23T08:30:00Z", "2025-10-23T09:15:00Z")],
      "2025-10-23",
      "UTC",
    );

    expect(block?.topMinutes).toBe(8 * 60 + 30);
    expect(block?.heightMinutes).toBe(45);
    expect(block?.column).toBe(0);
    expect(block?.columnCount).toBe(1);
  });

  it("uses the zone so the same instant falls on a different local hour", () => {
    const [block] = layoutTimedEvents(
      [event("a", "2025-10-23T08:00:00Z", "2025-10-23T09:00:00Z")],
      "2025-10-23",
      "Europe/Warsaw",
    );

    expect(block?.topMinutes).toBe(10 * 60);
  });

  it("shares the width equally between overlapping events", () => {
    const blocks = layoutTimedEvents(
      [
        event("a", "2025-10-23T09:00:00Z", "2025-10-23T10:00:00Z"),
        event("b", "2025-10-23T09:30:00Z", "2025-10-23T10:30:00Z"),
      ],
      "2025-10-23",
      "UTC",
    );

    expect(blocks.map((block) => [block.item.id, block.column, block.columnCount])).toEqual([
      ["a", 0, 2],
      ["b", 1, 2],
    ]);
  });

  it("reuses a column once the earlier event has ended", () => {
    const blocks = layoutTimedEvents(
      [
        event("a", "2025-10-23T09:00:00Z", "2025-10-23T10:00:00Z"),
        event("b", "2025-10-23T09:15:00Z", "2025-10-23T09:45:00Z"),
        event("c", "2025-10-23T10:00:00Z", "2025-10-23T11:00:00Z"),
      ],
      "2025-10-23",
      "UTC",
    );

    const column = Object.fromEntries(blocks.map((block) => [block.item.id, block.column]));
    expect(column).toEqual({ a: 0, b: 1, c: 0 });
  });

  it("keeps non-overlapping events in separate clusters at full width", () => {
    const blocks = layoutTimedEvents(
      [
        event("a", "2025-10-23T08:00:00Z", "2025-10-23T09:00:00Z"),
        event("b", "2025-10-23T12:00:00Z", "2025-10-23T13:00:00Z"),
      ],
      "2025-10-23",
      "UTC",
    );

    expect(blocks.every((block) => block.columnCount === 1)).toBe(true);
  });

  it("clips an event that continues from the previous day to the top of the grid", () => {
    const [block] = layoutTimedEvents(
      [event("a", "2025-10-22T23:00:00Z", "2025-10-23T01:00:00Z")],
      "2025-10-23",
      "UTC",
    );

    expect(block?.topMinutes).toBe(0);
    expect(block?.heightMinutes).toBe(60);
  });

  it("drops an event that does not touch the day", () => {
    expect(
      layoutTimedEvents(
        [event("a", "2025-10-24T08:00:00Z", "2025-10-24T09:00:00Z")],
        "2025-10-23",
        "UTC",
      ),
    ).toEqual([]);
  });

  it("keeps the local clock time on the spring-forward day", () => {
    const [block] = layoutTimedEvents(
      [event("a", "2025-03-30T01:30:00Z", "2025-03-30T02:30:00Z")],
      "2025-03-30",
      "Europe/Warsaw",
    );

    expect(block?.topMinutes).toBe(3 * 60 + 30);
    expect(MINUTES_PER_DAY).toBe(1440);
  });

  it("shows the now line only on the selected day", () => {
    const now = new Date("2025-10-23T08:45:00Z");

    expect(nowMinutesOnDate(now, "2025-10-23", "UTC")).toBe(8 * 60 + 45);
    expect(nowMinutesOnDate(now, "2025-10-24", "UTC")).toBeNull();
  });
});
