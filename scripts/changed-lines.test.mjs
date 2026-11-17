// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { CHANGED_LINES_DIFF_ARGS, changedLineMap, parseChangedLines } from "./changed-lines.mjs";

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

test("the changed-line diff uses the patience algorithm", () => {
  assert.ok(CHANGED_LINES_DIFF_ARGS.includes("--diff-algorithm=patience"));
});

test("changedLineMap reports the lines a commit adds to a tracked file", () => {
  const root = mkdtempSync(join(tmpdir(), "changed-lines-"));
  try {
    const run = (args) => execFileSync("git", args, { cwd: root, stdio: "pipe" });
    run(["init", "-q", "-b", "main"]);
    run(["config", "user.email", "test@example.invalid"]);
    run(["config", "user.name", "test"]);
    writeFileSync(join(root, "a.ts"), "one\ntwo\n");
    run(["add", "a.ts"]);
    run(["commit", "-qm", "base"]);
    writeFileSync(join(root, "a.ts"), "one\nnew\ntwo\n");
    assert.deepEqual([...changedLineMap(root, "main").get("a.ts")], [2]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
