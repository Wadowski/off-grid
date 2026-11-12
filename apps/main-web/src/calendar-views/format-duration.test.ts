// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import { formatDuration } from "./format-duration.js";

const t = ((key: string, options: Record<string, number>): string =>
  `${key}:${JSON.stringify(options)}`) as unknown as TFunction;

describe("formatDuration", () => {
  it("uses minutes below an hour", () => {
    expect(formatDuration(45, t)).toBe('calendar.mobileViews.duration:{"minutes":45}');
  });

  it("uses hours on whole hours", () => {
    expect(formatDuration(120, t)).toBe('calendar.mobileViews.durationHours:{"hours":2}');
  });

  it("uses hours and minutes otherwise", () => {
    expect(formatDuration(90, t)).toBe(
      'calendar.mobileViews.durationHoursMinutes:{"hours":1,"minutes":30}',
    );
  });
});
