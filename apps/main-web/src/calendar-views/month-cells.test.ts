// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { monthCells } from "./month-cells.js";

const monthOf = (year: number, month: number, length: number): string[] =>
  Array.from(
    { length },
    (_, index) => `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
  );

describe("monthCells", () => {
  it("returns no cells for an empty month", () => {
    expect(monthCells([])).toEqual([]);
  });

  it("pads a month that starts on Monday with no leading days", () => {
    const cells = monthCells(monthOf(2026, 6, 30));
    expect(cells[0]).toEqual({ date: "2026-06-01", inMonth: true });
    expect(cells).toHaveLength(35);
    expect(cells.at(-1)).toEqual({ date: "2026-07-05", inMonth: false });
  });

  it("adds six leading days for a month that starts on Sunday", () => {
    const cells = monthCells(monthOf(2026, 2, 28));
    expect(cells.slice(0, 6).map((cell) => cell.date)).toEqual([
      "2026-01-26",
      "2026-01-27",
      "2026-01-28",
      "2026-01-29",
      "2026-01-30",
      "2026-01-31",
    ]);
    expect(cells[6]).toEqual({ date: "2026-02-01", inMonth: true });
    expect(cells.length % 7).toBe(0);
  });

  it("fills six rows for a month that needs them", () => {
    const cells = monthCells(monthOf(2026, 11, 30));
    expect(cells).toHaveLength(42);
    expect(cells[0]).toEqual({ date: "2026-10-26", inMonth: false });
    expect(cells.at(-1)).toEqual({ date: "2026-12-06", inMonth: false });
  });

  it("marks only the days of the month as in the month", () => {
    const cells = monthCells(monthOf(2026, 11, 30));
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(30);
  });
});
