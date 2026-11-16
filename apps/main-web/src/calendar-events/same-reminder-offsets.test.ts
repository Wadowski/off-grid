// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { sameReminderOffsets } from "./same-reminder-offsets.js";

describe("sameReminderOffsets", () => {
  it("treats a reordered list as the same set", () => {
    expect(sameReminderOffsets([60, 15], [15, 60])).toBe(true);
  });

  it("treats two empty lists as the same", () => {
    expect(sameReminderOffsets([], [])).toBe(true);
  });

  it("tells lists of different content or length apart", () => {
    expect(sameReminderOffsets([15], [30])).toBe(false);
    expect(sameReminderOffsets([15], [15, 30])).toBe(false);
  });

  it("does not change the lists it compares", () => {
    const first = [60, 15];
    sameReminderOffsets(first, [15, 60]);

    expect(first).toEqual([60, 15]);
  });
});
