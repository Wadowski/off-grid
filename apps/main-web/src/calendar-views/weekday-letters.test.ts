// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";

import { WEEKDAY_KEYS, weekdayLetters } from "./weekday-letters.js";

describe("weekdayLetters", () => {
  it("translates the seven weekday keys in Monday-first order", () => {
    const t = ((key: string) => key) as unknown as TFunction;

    expect(weekdayLetters(t)).toEqual([...WEEKDAY_KEYS]);
    expect(weekdayLetters(t)).toHaveLength(7);
    expect(weekdayLetters(t)[0]).toBe("calendar.mobileViews.weekdayMonday");
    expect(weekdayLetters(t)[6]).toBe("calendar.mobileViews.weekdaySunday");
  });
});
