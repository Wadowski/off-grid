// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { shardSegmentsForKey } from "./shard-segments-for-key.js";

describe("shardSegmentsForKey", () => {
  it("takes the first two and the next two characters of the key", () => {
    expect(shardSegmentsForKey("abcd" + "1".repeat(28))).toEqual(["ab", "cd"]);
  });
});
