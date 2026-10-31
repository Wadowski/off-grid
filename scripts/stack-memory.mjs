#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync } from "node:fs";

const UNIT_TO_MIB = {
  B: 1 / 1024 / 1024,
  kB: 1000 / 1024 / 1024,
  KiB: 1 / 1024,
  MB: (1000 * 1000) / 1024 / 1024,
  MiB: 1,
  GB: (1000 * 1000 * 1000) / 1024 / 1024,
  GiB: 1024,
};
const MEM_USAGE = /^\s*([\d.]+)\s*([A-Za-z]+)\s*\/\s*/;

function parseMemUsageMiB(memUsage) {
  const match = MEM_USAGE.exec(memUsage);
  const unit = match && UNIT_TO_MIB[match[2]];
  if (!match || unit === undefined) {
    throw new Error(`unrecognised memory usage: "${memUsage}"`);
  }
  return Number(match[1]) * unit;
}

function parseStatsLines(text) {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const [name, memUsage] = line.split("|");
      if (memUsage === undefined) {
        throw new Error(`expected "name|memory" but got "${line}"`);
      }
      return { name, mib: parseMemUsageMiB(memUsage) };
    });
}

function parseBudgetMiB(value) {
  if (value.trim() === "") {
    return undefined;
  }
  const budget = Number(value);
  if (!Number.isFinite(budget) || budget <= 0) {
    throw new Error(`OFFGRID_MEMORY_BUDGET_MB must be a positive number, got "${value}"`);
  }
  return budget;
}

function totalMiB(services) {
  return services.reduce((sum, service) => sum + service.mib, 0);
}

function renderMemoryReport(services, budgetMiB) {
  const total = totalMiB(services);
  const rows = services.map((service) => `| ${service.name} | ${service.mib.toFixed(1)} |`);
  const budgetLine =
    budgetMiB === undefined
      ? "Budget: not set (report only)."
      : `Budget: ${budgetMiB} MiB, total ${total > budgetMiB ? "over" : "within"} budget.`;
  return [
    "## Stack memory",
    "",
    "| Service | MiB |",
    "| --- | ---: |",
    ...rows,
    `| **total** | **${total.toFixed(1)}** |`,
    "",
    budgetLine,
    "",
  ].join("\n");
}

function main() {
  const services = parseStatsLines(readFileSync(0, "utf8"));
  if (services.length === 0) {
    throw new Error("no running containers reported by docker stats");
  }
  const budgetMiB = parseBudgetMiB(process.env.OFFGRID_MEMORY_BUDGET_MB ?? "");
  process.stdout.write(renderMemoryReport(services, budgetMiB));
  if (budgetMiB !== undefined && totalMiB(services) > budgetMiB) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(`stack-memory: ${error.message}`);
  process.exitCode = 1;
}
