#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const WIP_TAG = /^\s*@.*(?:^|\s)@wip(?:\s|$)/m;
const OPEN_WIP_HEADING = /^## Open `@wip` scenarios\s*$/m;
const NEXT_HEADING = /^## /m;

export function unlistedWipFiles(features, prBody) {
  const section = openWipSection(prBody);
  return Object.entries(features)
    .filter(([, content]) => WIP_TAG.test(content))
    .filter(([path]) => !section.includes(path) && !section.includes(basename(path)))
    .map(([path]) => path);
}

function openWipSection(prBody) {
  const heading = OPEN_WIP_HEADING.exec(prBody);
  if (!heading) {
    return "";
  }
  const rest = prBody.slice(heading.index + heading[0].length);
  const next = NEXT_HEADING.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

function basename(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}

function changedFeatureFiles(base) {
  const output = execFileSync(
    "git",
    ["diff", "--name-only", "--diff-filter=d", `${base}...HEAD`, "--", "*.feature"],
    { encoding: "utf8" },
  );
  return output.split("\n").filter((line) => line !== "");
}

function main() {
  const base = process.env.BASE_REF ?? "origin/main";
  const prBody = process.env.PR_BODY ?? "";
  const features = Object.fromEntries(
    changedFeatureFiles(base).map((path) => [path, readFileSync(path, "utf8")]),
  );
  const offenders = unlistedWipFiles(features, prBody);
  if (offenders.length === 0) {
    console.log(`check-wip-tags: ok (${Object.keys(features).length} changed feature files)`);
    return;
  }
  console.error("check-wip-tags: these changed feature files still carry @wip and are not");
  console.error("listed under '## Open `@wip` scenarios' in the pull request body:");
  for (const path of offenders) {
    console.error(`  ${path}`);
  }
  process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
