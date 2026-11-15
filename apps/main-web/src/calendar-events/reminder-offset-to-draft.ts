// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { REMINDER_UNIT_MINUTES, REMINDER_UNITS_LARGEST_FIRST } from "./constants.js";
import type { ReminderDraft } from "./types.js";

export const reminderOffsetToDraft = (minutes: number, key: number): ReminderDraft => {
  for (const unit of REMINDER_UNITS_LARGEST_FIRST) {
    const factor = REMINDER_UNIT_MINUTES[unit];
    if (minutes !== 0 && minutes % factor === 0) {
      return { key, amount: String(minutes / factor), unit };
    }
  }
  return { key, amount: String(minutes), unit: "minute" };
};
