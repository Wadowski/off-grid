// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { test } from "node:test";
import { parseWorktrees, planCleanup } from "./wt-cleanup.mjs";

const porcelain = [
  "worktree /work/offgrid\nHEAD aaa\nbranch refs/heads/main",
  "worktree /work/offgrid-og-9\nHEAD bbb\nbranch refs/heads/og-9-thing",
].join("\n\n");

test("parseWorktrees reads paths and branches", () => {
  assert.deepEqual(parseWorktrees(porcelain), [
    { path: "/work/offgrid", branch: "main" },
    { path: "/work/offgrid-og-9", branch: "og-9-thing" },
  ]);
});

test("planCleanup removes a linked worktree and refuses the main checkout", () => {
  const worktrees = parseWorktrees(porcelain);
  assert.deepEqual(planCleanup(worktrees, "og-9-thing", "/work/offgrid"), {
    removeWorktree: "/work/offgrid-og-9",
    checkedOutInMain: false,
  });
  assert.equal(planCleanup(worktrees, "main", "/work/offgrid").checkedOutInMain, true);
  assert.equal(planCleanup(worktrees, "gone", "/work/offgrid").removeWorktree, null);
});
