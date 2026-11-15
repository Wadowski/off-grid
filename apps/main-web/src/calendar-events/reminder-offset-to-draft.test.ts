// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { reminderDraftToOffset } from "./reminder-draft-to-offset.js";
import { reminderOffsetToDraft } from "./reminder-offset-to-draft.js";

describe("reminderOffsetToDraft", () => {
  it.each([
    [0, "0", "minute"],
    [1, "1", "minute"],
    [59, "59", "minute"],
    [60, "1", "hour"],
    [90, "90", "minute"],
    [120, "2", "hour"],
    [1440, "1", "day"],
    [10080, "1", "week"],
    [40320, "4", "week"],
  ] as const)("shows %i minutes as %s %s", (minutes, amount, unit) => {
    expect(reminderOffsetToDraft(minutes, 7)).toEqual({ key: 7, amount, unit });
  });

  it("keeps every allowed offset when it is converted back", () => {
    for (const minutes of [0, 1, 45, 90, 119, 120, 1500, 10081, 40319, 40320]) {
      const draft = reminderOffsetToDraft(minutes, 0);

      expect(reminderDraftToOffset(draft.amount, draft.unit)).toEqual({ ok: true, minutes });
    }
  });
});
