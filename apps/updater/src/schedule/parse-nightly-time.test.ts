// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { parseNightlyTime } from "./parse-nightly-time.js";

describe("parseNightlyTime", () => {
  it.each([
    ["03:30", { hour: 3, minute: 30 }],
    ["00:00", { hour: 0, minute: 0 }],
    ["23:59", { hour: 23, minute: 59 }],
  ])("splits %s into hour and minute", (value, expected) => {
    expect(parseNightlyTime(value)).toEqual(expected);
  });
});
