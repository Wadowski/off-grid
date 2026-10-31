#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const OPEN_WIP_HEADING = /^## Open `@wip` scenarios\s*$/m;
const NEXT_HEADING = /^## /m;
const NAME_SEPARATORS = /[^\w./-]+/;

function hasWipTag(content) {
  return content
    .split("\n")
    .some((line) => line.trimStart().startsWith("@") && line.split(/\s+/).includes("@wip"));
}

function openWipNames(prBody) {
  const heading = OPEN_WIP_HEADING.exec(prBody);
  if (!heading) {
    return new Set();
  }
  const rest = prBody.slice(heading.index + heading[0].length);
  const next = NEXT_HEADING.exec(rest);
  const section = next ? rest.slice(0, next.index) : rest;
  return new Set(section.split(NAME_SEPARATORS));
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
  const listed = openWipNames(process.env.PR_BODY ?? "");
  const files = changedFeatureFiles(base);
  const offenders = files
    .filter((path) => hasWipTag(readFileSync(path, "utf8")))
    .filter((path) => !listed.has(path) && !listed.has(basename(path)));
  if (offenders.length === 0) {
    console.log(`check-wip-tags: ok (${files.length} changed feature files)`);
    return;
  }
  console.error("check-wip-tags: these changed feature files still carry @wip and are not");
  console.error("listed under '## Open `@wip` scenarios' in the pull request body:");
  for (const path of offenders) {
    console.error(`  ${path}`);
  }
  process.exitCode = 1;
}

main();
