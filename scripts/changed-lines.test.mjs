// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { test } from "node:test";
import { parseChangedLines } from "./changed-lines.mjs";

test("parseChangedLines maps hunks to added line numbers", () => {
  const diff = [
    "diff --git a/src/a.ts b/src/a.ts",
    "--- a/src/a.ts",
    "+++ b/src/a.ts",
    "@@ -3,0 +4,2 @@",
    "+x",
    "+y",
    "@@ -10 +12 @@",
    "-old",
    "+new",
    "--- a/src/gone.ts",
    "+++ /dev/null",
    "@@ -1,2 +0,0 @@",
  ].join("\n");
  const result = parseChangedLines(diff);
  assert.deepEqual([...result.get("src/a.ts")], [4, 5, 12]);
  assert.equal(result.has("src/gone.ts"), false);
});
