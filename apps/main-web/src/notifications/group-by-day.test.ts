// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { groupByDay } from "./group-by-day.js";

const WARSAW = "Europe/Warsaw";
const LOS_ANGELES = "America/Los_Angeles";
const NEW_YORK = "America/New_York";
const NOW = new Date("2026-11-19T11:00:00Z");

const TODAY = { textId: "notifications.groups.today" };
const YESTERDAY = { textId: "notifications.groups.yesterday" };

const labelsOf = (groups: ReturnType<typeof groupByDay>): unknown[] =>
  groups.map((group) => group.label);

describe("groupByDay", () => {
  it("returns no groups for empty input", () => {
    expect(groupByDay([], NOW, WARSAW)).toEqual([]);
  });

  it("groups into Today and Yesterday, then one group per earlier date, in input order", () => {
    const items = [
      { id: "a", createdAt: "2026-11-19T09:00:00Z" },
      { id: "b", createdAt: "2026-11-18T15:42:00Z" },
      { id: "c", createdAt: "2026-11-10T09:05:00Z" },
      { id: "d", createdAt: "2026-11-09T08:00:00Z" },
    ];
    const groups = groupByDay(items, NOW, WARSAW);

    expect(groups.map((group) => group.dateKey)).toEqual([
      "2026-11-19",
      "2026-11-18",
      "2026-11-10",
      "2026-11-09",
    ]);
    expect(labelsOf(groups)).toEqual([TODAY, YESTERDAY, { value: "10 Nov" }, { value: "9 Nov" }]);
    expect(groups.map((group) => group.items.map((item) => item.id))).toEqual([
      ["a"],
      ["b"],
      ["c"],
      ["d"],
    ]);
  });

  it("keeps the input order of items within a group", () => {
    const items = [
      { id: "late", createdAt: "2026-11-18T20:00:00Z" },
      { id: "early", createdAt: "2026-11-18T06:00:00Z" },
    ];
    const [group] = groupByDay(items, NOW, WARSAW);

    expect(group?.items.map((item) => item.id)).toEqual(["late", "early"]);
  });

  it("adds the year to an earlier date from another year", () => {
    const items = [{ id: "old", createdAt: "2025-12-30T10:00:00Z" }];

    expect(labelsOf(groupByDay(items, NOW, WARSAW))).toEqual([{ value: "30 Dec 2025" }]);
  });

  it("follows the given zone, not UTC, for a 23:30 UTC item", () => {
    const item = [{ id: "a", createdAt: "2026-11-18T23:30:00Z" }];
    const now = new Date("2026-11-19T11:00:00Z");

    expect(labelsOf(groupByDay(item, now, WARSAW))).toEqual([TODAY]);
    expect(labelsOf(groupByDay(item, now, LOS_ANGELES))).toEqual([YESTERDAY]);
  });

  it("splits items at local midnight", () => {
    const items = [
      { id: "before", createdAt: "2026-11-18T22:59:59Z" },
      { id: "after", createdAt: "2026-11-18T23:00:00Z" },
    ];
    const groups = groupByDay(items, new Date("2026-11-19T10:00:00Z"), WARSAW);

    expect(groups.map((group) => [group.label, group.items.map((item) => item.id)])).toEqual([
      [YESTERDAY, ["before"]],
      [TODAY, ["after"]],
    ]);
  });

  it("groups a spring-forward 23 hour day correctly in New York", () => {
    const items = [
      { id: "early", createdAt: "2026-03-08T06:30:00Z" },
      { id: "late", createdAt: "2026-03-08T20:00:00Z" },
      { id: "before", createdAt: "2026-03-07T23:30:00Z" },
    ];
    const groups = groupByDay(items, new Date("2026-03-09T12:00:00Z"), NEW_YORK);

    expect(groups.map((group) => [group.label, group.items.map((item) => item.id)])).toEqual([
      [YESTERDAY, ["early", "late"]],
      [{ value: "7 Mar" }, ["before"]],
    ]);
  });

  it("groups a fall-back 25 hour day correctly in New York", () => {
    const items = [
      { id: "first", createdAt: "2026-11-01T05:30:00Z" },
      { id: "second", createdAt: "2026-11-01T06:30:00Z" },
      { id: "noon", createdAt: "2026-11-01T12:00:00Z" },
    ];
    const groups = groupByDay(items, new Date("2026-11-02T12:00:00Z"), NEW_YORK);

    expect(groups.map((group) => [group.label, group.items.map((item) => item.id)])).toEqual([
      [YESTERDAY, ["first", "second", "noon"]],
    ]);
  });
});
