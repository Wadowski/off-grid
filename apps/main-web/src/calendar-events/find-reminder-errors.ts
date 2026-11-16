// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { reminderDraftToOffset } from "./reminder-draft-to-offset.js";
import type { ReminderDraft, ReminderErrorCode } from "./types.js";

export const findReminderErrors = (
  drafts: readonly ReminderDraft[],
): readonly (ReminderErrorCode | undefined)[] => {
  const seen = new Set<number>();
  return drafts.map((draft) => {
    const result = reminderDraftToOffset(draft.amount, draft.unit);
    if (!result.ok) {
      return result.error;
    }
    if (seen.has(result.minutes)) {
      return "duplicate";
    }
    seen.add(result.minutes);
    return undefined;
  });
};
