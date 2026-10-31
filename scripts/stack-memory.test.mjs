// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "stack-memory.mjs");

function runReport(input, budget = "") {
  return spawnSync(process.execPath, [SCRIPT], {
    input,
    env: { ...process.env, OFFGRID_MEMORY_BUDGET_MB: budget },
    encoding: "utf8",
  });
}

const STATS = "offgrid-e2e-local-server-1|120MiB / 7.7GiB\noffgrid-e2e-local-db-1|80MiB / 7.7GiB\n";

describe("stack-memory", () => {
  it("lists each service and the total, and passes with no budget", () => {
    const result = runReport(STATS);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /\| offgrid-e2e-local-server-1 \| 120\.0 \|/);
    assert.match(result.stdout, /\| \*\*total\*\* \| \*\*200\.0\*\* \|/);
    assert.match(result.stdout, /Budget: not set \(report only\)\./);
  });

  it("converts decimal units to MiB", () => {
    const result = runReport("svc|1000MB / 7.7GB\n");
    assert.match(result.stdout, /\| svc \| 953\.7 \|/);
  });

  it("passes when the total is within the budget", () => {
    const result = runReport(STATS, "1000");
    assert.equal(result.status, 0);
    assert.match(result.stdout, /within budget/);
  });

  it("fails when the total is over the budget", () => {
    const result = runReport(STATS, "199");
    assert.equal(result.status, 1);
    assert.match(result.stdout, /over budget/);
  });

  it("rejects a budget that is not a positive number", () => {
    const result = runReport(STATS, "lots");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /positive number/);
  });

  it("rejects input with no containers", () => {
    const result = runReport("");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /no running containers/);
  });

  it("names the line that is not in name|memory form", () => {
    const result = runReport("server 120MiB\n");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /expected "name\|memory" but got "server 120MiB"/);
  });

  it("rejects an unknown memory unit", () => {
    const result = runReport("svc|3 pages / 7.7GiB\n");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unrecognised memory usage/);
  });
});
