// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isShardSegment } from "./is-shard-segment.js";

describe("isShardSegment", () => {
  it.each([
    ["00", true],
    ["af", true],
    ["AF", false],
    ["a", false],
    ["abc", false],
    ["g0", false],
    ["..", false],
  ])("returns true only for two lowercase hex characters: %j is %s", (name, expected) => {
    expect(isShardSegment(name)).toBe(expected);
  });
});
