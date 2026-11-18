// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { test } from "node:test";
import { pendingChecks, planChecks, runAll } from "./verify.mjs";

const names = (checks) => checks.map(([name]) => name);

test("planChecks adds checks by what changed", () => {
  assert.ok(!names(planChecks(["docs/a.md"])).includes("build"));
  assert.ok(names(planChecks(["apps/main-web/src/a.ts"])).includes("build"));
  assert.ok(names(planChecks(["e2e/features/x/y.feature"])).includes("features"));
  assert.ok(names(planChecks(["infra/compose/docker-compose.yml"])).includes("compose"));
  assert.ok(!names(planChecks(["docs/a.md"])).includes("compose"));
  assert.ok(names(planChecks(["packages/contracts/src/a.ts"])).includes("contracts"));
});

test("pendingChecks skips checks that passed on the same tree", () => {
  const checks = [
    ["lint", []],
    ["test", []],
  ];
  const stamp = { fingerprint: "abc", passed: ["lint"] };
  assert.deepEqual(names(pendingChecks(checks, stamp, "abc")), ["test"]);
  assert.deepEqual(names(pendingChecks(checks, stamp, "other")), ["lint", "test"]);
});

test("runAll runs every check and returns every result", async () => {
  const checks = [
    ["a", []],
    ["b", []],
    ["c", []],
    ["d", []],
    ["e", []],
    ["f", []],
  ];
  const results = await runAll(checks, "/", async ([name]) => ({
    name,
    ok: name !== "c",
    output: "",
  }));
  assert.deepEqual(results.map((r) => r.name).sort(), ["a", "b", "c", "d", "e", "f"]);
  assert.equal(results.filter((r) => !r.ok).length, 1);
});
