#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const CONSUMERS = {
  family: ["calendar"],
  identity: ["family"],
};

const MODULE_PATH = /^modules\/([a-z-]+)\//;
const FEATURE_PATH = /^e2e\/features\/.+\.feature$/;
const NO_SCENARIO_PATH = /^(docs\/|\.claude\/|[^/]+\.md$)/;
const MODULE_TAG = /@module:([a-z-]+)/g;

const withConsumers = (name) => [name, ...(CONSUMERS[name] ?? [])];

export const planFor = (changedFiles, readFeatureModules) => {
  const modules = new Set();
  const reasons = [];
  for (const file of changedFiles) {
    const moduleMatch = MODULE_PATH.exec(file);
    if (moduleMatch) {
      withConsumers(moduleMatch[1]).forEach((name) => modules.add(name));
      continue;
    }
    if (FEATURE_PATH.test(file)) {
      const tagged = readFeatureModules(file);
      if (tagged.length === 0) {
        return { mode: "full", modules: [], reasons: [`${file} has no @module tag`] };
      }
      tagged.forEach((name) => modules.add(name));
      continue;
    }
    if (NO_SCENARIO_PATH.test(file)) {
      continue;
    }
    return { mode: "full", modules: [], reasons: [`${file} is shared code or unknown`] };
  }
  if (modules.size === 0) {
    return { mode: "none", modules: [], reasons };
  }
  return { mode: "tags", modules: [...modules].sort(), reasons };
};

export const grepFor = (plan) =>
  plan.mode === "tags" ? `@module:(${plan.modules.join("|")})` : null;

const readFeatureModules = (path) => {
  const tags = readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.trimStart().startsWith("@"));
  return [...tags.join(" ").matchAll(MODULE_TAG)].map((match) => match[1]);
};

const git = (args) => execFileSync("git", args, { encoding: "utf8" }).split("\n").filter(Boolean);

export const changedFiles = (base) => [
  ...git(["diff", "--name-only", "--diff-filter=d", base]),
  ...git(["ls-files", "--others", "--exclude-standard"]),
];

const runPlaywright = (plan) => {
  const args = ["--filter", "@offgrid/e2e", "exec"];
  const bdd = spawnSync("pnpm", [...args, "bddgen"], { stdio: "inherit" });
  if (bdd.status !== 0) {
    return bdd.status ?? 1;
  }
  const grep = grepFor(plan);
  const selection = grep ? ["--grep", grep] : [];
  const run = spawnSync(
    "pnpm",
    [...args, "playwright", "test", "--grep-invert", "@wip", ...selection, "--trace", "off"],
    { stdio: "inherit" },
  );
  return run.status ?? 1;
};

const main = () => {
  const base = process.env.BASE_REF ?? "origin/main";
  const run = process.argv.includes("--run");
  const plan = planFor(changedFiles(base), readFeatureModules);
  const grep = grepFor(plan);
  const summary =
    plan.mode === "full"
      ? "all scenarios"
      : plan.mode === "tags"
        ? `modules ${plan.modules.join(", ")} (grep ${grep})`
        : "no scenario";
  console.log(`e2e-affected: ${plan.mode}, ${summary}`);
  plan.reasons.forEach((reason) => console.log(`  full run because ${reason}`));
  if (!run) {
    return 0;
  }
  if (plan.mode === "none") {
    console.log("e2e-affected: no scenario is affected by these changes; nothing to run");
    return 0;
  }
  return runPlaywright(plan);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
