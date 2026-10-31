// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  isOverBudget,
  parseBudgetMiB,
  parseMemUsageMiB,
  parseStatsLines,
  renderMemoryReport,
} from "./stack-memory.mjs";

describe("parseMemUsageMiB", () => {
  it("reads binary units", () => {
    assert.equal(parseMemUsageMiB("45.5MiB / 7.7GiB"), 45.5);
    assert.equal(parseMemUsageMiB("2GiB / 7.7GiB"), 2048);
    assert.equal(parseMemUsageMiB("512KiB / 7.7GiB"), 0.5);
  });

  it("converts decimal units to MiB", () => {
    assert.equal(parseMemUsageMiB("1000MB / 7.7GB"), (1000 * 1000 * 1000) / 1024 / 1024);
  });

  it("rejects an unknown unit", () => {
    assert.throws(() => parseMemUsageMiB("3 pages / 7.7GiB"), /unrecognised memory usage/);
  });
});

describe("parseStatsLines", () => {
  it("reads one service per line and skips blank lines", () => {
    const text =
      "offgrid-e2e-local-server-1|120MiB / 7.7GiB\n\noffgrid-e2e-local-db-1|80MiB / 7.7GiB\n";
    assert.deepEqual(parseStatsLines(text), [
      { name: "offgrid-e2e-local-server-1", mib: 120 },
      { name: "offgrid-e2e-local-db-1", mib: 80 },
    ]);
  });
});

describe("parseBudgetMiB", () => {
  it("is unset for an empty or missing value", () => {
    assert.equal(parseBudgetMiB(""), undefined);
    assert.equal(parseBudgetMiB("   "), undefined);
    assert.equal(parseBudgetMiB(undefined), undefined);
  });

  it("reads a positive number", () => {
    assert.equal(parseBudgetMiB("1024"), 1024);
  });

  it("rejects a value that is not a positive number", () => {
    assert.throws(() => parseBudgetMiB("lots"), /positive number/);
    assert.throws(() => parseBudgetMiB("0"), /positive number/);
  });
});

describe("isOverBudget", () => {
  const services = [
    { name: "server", mib: 300 },
    { name: "db", mib: 200 },
  ];

  it("never fails when no budget is set", () => {
    assert.equal(isOverBudget(services, undefined), false);
  });

  it("fails only when the total exceeds the budget", () => {
    assert.equal(isOverBudget(services, 500), false);
    assert.equal(isOverBudget(services, 499), true);
  });
});

describe("renderMemoryReport", () => {
  const services = [
    { name: "server", mib: 300 },
    { name: "db", mib: 200 },
  ];

  it("lists each service and the total", () => {
    const report = renderMemoryReport(services, undefined);
    assert.match(report, /\| server \| 300\.0 \|/);
    assert.match(report, /\| \*\*total\*\* \| \*\*500\.0\*\* \|/);
    assert.match(report, /Budget: not set \(report only\)\./);
  });

  it("says whether the total is within the budget", () => {
    assert.match(renderMemoryReport(services, 1000), /within budget/);
    assert.match(renderMemoryReport(services, 400), /over budget/);
  });
});
