// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// Checks that every commit in a range carries a Developer Certificate of Origin
// sign-off: a `Signed-off-by:` trailer that names the commit's author.
//
//   node scripts/check-dco.mjs                 check origin/main..HEAD
//   node scripts/check-dco.mjs <rev-range>     check the given range, e.g. main..HEAD

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const DEFAULT_RANGE = "origin/main..HEAD";

// Returns the commits in `range` that lack a matching sign-off. `git` runs a
// git command and returns its trimmed stdout; it defaults to the current repo.
export function findUnsigned(range, git = runGit) {
  const shas = git(["rev-list", "--reverse", range]).split("\n").filter(Boolean);
  return shas.filter((sha) => !isSigned(git, sha));
}

function isSigned(git, sha) {
  const [name, email] = git(["log", "-1", "--format=%an%n%ae", sha]).split("\n");
  const trailers = git(["log", "-1", "--format=%B", sha])
    .split("\n")
    .filter((line) => /^Signed-off-by:/i.test(line))
    .map((line) => line.replace(/^Signed-off-by:\s*/i, "").trim());
  return trailers.some((trailer) => trailer === `${name} <${email}>`);
}

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trimEnd();
}

function main() {
  const range = process.argv[2] ?? DEFAULT_RANGE;
  const unsigned = findUnsigned(range);
  if (unsigned.length === 0) {
    console.log(`DCO: all commits in ${range} are signed off`);
    return;
  }
  console.error(`DCO: ${unsigned.length} commit(s) in ${range} lack a Signed-off-by trailer:`);
  for (const sha of unsigned) {
    console.error(`  ${runGit(["log", "-1", "--format=%h %s", sha])}`);
  }
  console.error("Add one with `git commit -s` or `git commit --amend -s`.");
  process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
