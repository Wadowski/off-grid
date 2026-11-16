// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MAX_REMINDER_OFFSET_MINUTES } from "@offgrid/contracts";
import { REMINDER_UNIT_MINUTES } from "./constants.js";
import type { ReminderOffsetResult, ReminderUnit } from "./types.js";

export const reminderDraftToOffset = (amount: string, unit: ReminderUnit): ReminderOffsetResult => {
  const text = amount.trim();
  if (text === "") {
    return { ok: false, error: "empty" };
  }
  const value = Number(text);
  if (!Number.isFinite(value)) {
    return { ok: false, error: "notWhole" };
  }
  if (value < 0) {
    return { ok: false, error: "negative" };
  }
  if (!Number.isInteger(value)) {
    return { ok: false, error: "notWhole" };
  }
  const minutes = value * REMINDER_UNIT_MINUTES[unit];
  if (minutes > MAX_REMINDER_OFFSET_MINUTES) {
    return { ok: false, error: "tooLarge" };
  }
  return { ok: true, minutes };
};
