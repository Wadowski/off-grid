#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { changedFiles, repoRoot, resolveBase } from "./changed-lines.mjs";

const FEATURE_PATH = /^e2e\/features\/.+\.feature$/;

export const featureArgs = (files) =>
  files
    .filter((file) => FEATURE_PATH.test(file))
    .map((file) => file.replace(/^e2e\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const main = () => {
  const root = repoRoot();
  const features = featureArgs(changedFiles(root, resolveBase(root)));
  if (features.length === 0) {
    console.log("e2e-changed: no feature file changed on this branch; nothing to run");
    return 0;
  }
  console.log(`e2e-changed: ${features.length} feature file(s)`);
  const prefix = ["--filter", "@offgrid/e2e", "exec"];
  const bdd = spawnSync("pnpm", [...prefix, "bddgen"], { cwd: root, stdio: "inherit" });
  if (bdd.status !== 0) return bdd.status ?? 1;
  const run = spawnSync(
    "pnpm",
    [...prefix, "playwright", "test", "--grep-invert", "@wip", "--trace", "off", ...features],
    { cwd: root, stdio: "inherit" },
  );
  return run.status ?? 1;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) process.exitCode = main();
