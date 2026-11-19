// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { nextNightlyRunAt } from "./next-nightly-run-at.js";

const NIGHTLY_TIME = { hour: 3, minute: 30 };

const localDate = (year: number, monthIndex: number, day: number, hour: number, minute: number) =>
  new Date(year, monthIndex, day, hour, minute);

describe("nextNightlyRunAt", () => {
  it("returns today's slot when the given time is before it", () => {
    const after = localDate(2026, 10, 19, 1, 15);

    expect(nextNightlyRunAt(after, NIGHTLY_TIME)).toEqual(localDate(2026, 10, 19, 3, 30));
  });

  it("returns tomorrow's slot when the given time is exactly the slot", () => {
    const after = localDate(2026, 10, 19, 3, 30);

    expect(nextNightlyRunAt(after, NIGHTLY_TIME)).toEqual(localDate(2026, 10, 20, 3, 30));
  });

  it("returns tomorrow's slot when the given time is after the slot", () => {
    const after = localDate(2026, 10, 19, 14, 0);

    expect(nextNightlyRunAt(after, NIGHTLY_TIME)).toEqual(localDate(2026, 10, 20, 3, 30));
  });

  it("rolls over the month", () => {
    const after = localDate(2026, 10, 30, 23, 59);

    expect(nextNightlyRunAt(after, NIGHTLY_TIME)).toEqual(localDate(2026, 11, 1, 3, 30));
  });

  it("rolls over the year", () => {
    const after = localDate(2026, 11, 31, 4, 0);

    expect(nextNightlyRunAt(after, NIGHTLY_TIME)).toEqual(localDate(2027, 0, 1, 3, 30));
  });

  it("handles a leap day", () => {
    const after = localDate(2028, 1, 28, 12, 0);

    expect(nextNightlyRunAt(after, NIGHTLY_TIME)).toEqual(localDate(2028, 1, 29, 3, 30));
  });

  it("always returns an instant strictly after the given one", () => {
    const after = localDate(2026, 5, 10, 3, 29);
    const next = nextNightlyRunAt(after, NIGHTLY_TIME);

    expect(next.getTime()).toBeGreaterThan(after.getTime());
  });
});
