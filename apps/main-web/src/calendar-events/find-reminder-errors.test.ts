// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { findReminderErrors } from "./find-reminder-errors.js";
import type { ReminderDraft } from "./types.js";

const draft = (key: number, amount: string, unit: ReminderDraft["unit"]): ReminderDraft => ({
  key,
  amount,
  unit,
});

describe("findReminderErrors", () => {
  it("finds no error in distinct valid reminders", () => {
    expect(findReminderErrors([draft(1, "15", "minute"), draft(2, "1", "hour")])).toEqual([
      undefined,
      undefined,
    ]);
  });

  it("flags the later of two reminders at the same time across units", () => {
    expect(findReminderErrors([draft(1, "1", "hour"), draft(2, "60", "minute")])).toEqual([
      undefined,
      "duplicate",
    ]);
  });

  it("reports each row's own error in row order", () => {
    expect(
      findReminderErrors([draft(1, "", "minute"), draft(2, "9", "week"), draft(3, "2", "day")]),
    ).toEqual(["empty", "tooLarge", undefined]);
  });

  it("does not count an invalid row as a duplicate source", () => {
    expect(findReminderErrors([draft(1, "x", "minute"), draft(2, "5", "minute")])).toEqual([
      "notWhole",
      undefined,
    ]);
  });
});
