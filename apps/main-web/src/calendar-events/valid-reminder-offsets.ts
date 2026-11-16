// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { reminderDraftToOffset } from "./reminder-draft-to-offset.js";
import type { ReminderDraft } from "./types.js";

export const validReminderOffsets = (drafts: readonly ReminderDraft[]): readonly number[] => {
  const offsets: number[] = [];
  for (const draft of drafts) {
    const result = reminderDraftToOffset(draft.amount, draft.unit);
    if (result.ok && !offsets.includes(result.minutes)) {
      offsets.push(result.minutes);
    }
  }
  return offsets;
};
