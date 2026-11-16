// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { validReminderOffsets } from "./valid-reminder-offsets.js";

describe("validReminderOffsets", () => {
  it("returns the minutes of the valid rows and skips invalid and repeated ones", () => {
    expect(
      validReminderOffsets([
        { key: 1, amount: "1", unit: "hour" },
        { key: 2, amount: "", unit: "minute" },
        { key: 3, amount: "60", unit: "minute" },
        { key: 4, amount: "2", unit: "day" },
      ]),
    ).toEqual([60, 2880]);
  });
});
