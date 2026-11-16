// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { reminderDraftToOffset } from "./reminder-draft-to-offset.js";

describe("reminderDraftToOffset", () => {
  it.each([
    ["15", "minute", 15],
    ["2", "hour", 120],
    ["3", "day", 4320],
    ["4", "week", 40320],
    ["0", "hour", 0],
    ["40320", "minute", 40320],
    [" 5 ", "minute", 5],
  ] as const)("converts %s %s to %i minutes", (amount, unit, minutes) => {
    expect(reminderDraftToOffset(amount, unit)).toEqual({ ok: true, minutes });
  });

  it.each([
    ["", "minute", "empty"],
    ["   ", "minute", "empty"],
    ["1.5", "hour", "notWhole"],
    ["abc", "minute", "notWhole"],
    ["-1", "minute", "negative"],
    ["-1.5", "minute", "negative"],
    ["40321", "minute", "tooLarge"],
    ["29", "day", "tooLarge"],
    ["5", "week", "tooLarge"],
  ] as const)("rejects %j %s as %s", (amount, unit, error) => {
    expect(reminderDraftToOffset(amount, unit)).toEqual({ ok: false, error });
  });
});
