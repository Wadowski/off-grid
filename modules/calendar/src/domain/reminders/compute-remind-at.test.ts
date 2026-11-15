// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isDue, isPast, remindAt } from "./compute-remind-at.js";

const startsAt = new Date("2026-11-20T09:00:00Z");

describe("remindAt", () => {
  it.each([
    [0, "2026-11-20T09:00:00.000Z"],
    [15, "2026-11-20T08:45:00.000Z"],
    [1440, "2026-11-19T09:00:00.000Z"],
    [40320, "2026-10-23T09:00:00.000Z"],
  ])("subtracts %i minutes from the start", (offset, expected) => {
    expect(remindAt(startsAt, offset).toISOString()).toBe(expected);
  });

  it("does not change the start it was given", () => {
    remindAt(startsAt, 15);
    expect(startsAt.toISOString()).toBe("2026-11-20T09:00:00.000Z");
  });
});

describe("isDue", () => {
  const reminderAt = new Date("2026-11-20T08:45:00Z");

  it("is due at the exact instant", () => {
    expect(isDue(reminderAt, new Date("2026-11-20T08:45:00Z"))).toBe(true);
  });

  it("is due after its instant", () => {
    expect(isDue(reminderAt, new Date("2026-11-20T08:45:01Z"))).toBe(true);
  });

  it("is not due one millisecond before its instant", () => {
    expect(isDue(reminderAt, new Date("2026-11-20T08:44:59.999Z"))).toBe(false);
  });
});

describe("isPast", () => {
  const reminderAt = new Date("2026-11-20T08:45:00Z");

  it("is past strictly before now", () => {
    expect(isPast(reminderAt, new Date("2026-11-20T08:45:01Z"))).toBe(true);
  });

  it("is not past at the exact instant, so the next claim fires it", () => {
    expect(isPast(reminderAt, new Date("2026-11-20T08:45:00Z"))).toBe(false);
  });
});
