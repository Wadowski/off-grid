#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { changedFiles, repoRoot, resolveBase } from "./changed-lines.mjs";

const FEATURE_PATH = /^e2e\/features\/.+\.feature$/;
const PNPM_E2E = ["--filter", "@offgrid/e2e", "exec"];

const escapePattern = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const specPathFor = (feature) =>
  `${feature.replace(/^e2e\/features\//, "e2e/.features-gen/")}.spec.js`;

export const planSpecs = (files, { featureExists, specExists }) => {
  const features = files.filter((file) => FEATURE_PATH.test(file) && featureExists(file));
  return {
    args: features.map((feature) => escapePattern(specPathFor(feature))),
    missing: features.filter((feature) => !specExists(specPathFor(feature))),
  };
};

const runPlaywright = (root, args) =>
  spawnSync(
    "pnpm",
    [...PNPM_E2E, "playwright", "test", "--grep-invert", "@wip", "--trace", "off", ...args],
    { cwd: root, stdio: "inherit" },
  ).status ?? 1;

const main = () => {
  const root = repoRoot();
  const files = changedFiles(root, resolveBase(root));
  const bdd = spawnSync("pnpm", [...PNPM_E2E, "bddgen"], { cwd: root, stdio: "inherit" });
  if (bdd.status !== 0) return bdd.status ?? 1;
  const { args, missing } = planSpecs(files, {
    featureExists: (file) => existsSync(join(root, file)),
    specExists: (spec) => existsSync(join(root, spec)),
  });
  if (missing.length > 0) {
    for (const feature of missing) console.error(`e2e-changed: no generated spec for ${feature}`);
    return 1;
  }
  if (args.length === 0) {
    console.log("e2e-changed: no feature file changed on this branch; nothing to run");
    return 0;
  }
  console.log(`e2e-changed: ${args.length} feature file(s)`);
  return runPlaywright(root, args);
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) process.exitCode = main();
