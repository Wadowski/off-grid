#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { commonDir } from "./changed-lines.mjs";

export const parseWorktrees = (porcelain) =>
  porcelain
    .split("\n\n")
    .map((block) => Object.fromEntries(block.split("\n").map((line) => line.split(/ (.*)/s))))
    .filter((entry) => entry.worktree)
    .map((entry) => ({
      path: entry.worktree,
      branch: (entry.branch ?? "").replace("refs/heads/", ""),
    }));

export const planCleanup = (worktrees, branch, mainPath) => {
  const owner = worktrees.find((entry) => entry.branch === branch);
  return {
    removeWorktree: owner && owner.path !== mainPath ? owner.path : null,
    checkedOutInMain: owner?.path === mainPath,
  };
};

const git = (cwd, args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

const main = () => {
  const args = process.argv.slice(2);
  const skipRemote = args.includes("--skip-remote");
  const branch = args.find((arg) => !arg.startsWith("--"));
  if (!branch) {
    console.error("usage: pnpm wt:cleanup <branch> [--skip-remote]");
    return 1;
  }
  const mainPath = dirname(commonDir(process.cwd()));
  const report = [];
  if (!skipRemote) {
    const merged = execFileSync(
      "gh",
      ["pr", "list", "--head", branch, "--state", "merged", "--json", "number", "--jq", "length"],
      { cwd: mainPath, encoding: "utf8" },
    ).trim();
    if (merged === "0") {
      console.error(`wt-cleanup: no merged pull request for ${branch}; nothing removed`);
      return 1;
    }
  }
  const plan = planCleanup(
    parseWorktrees(git(mainPath, ["worktree", "list", "--porcelain"])),
    branch,
    mainPath,
  );
  if (plan.checkedOutInMain) {
    console.error(
      `wt-cleanup: ${branch} is checked out in the main checkout; switch it to main first`,
    );
    return 1;
  }
  if (plan.removeWorktree) {
    git(mainPath, ["worktree", "remove", plan.removeWorktree]);
    report.push(`worktree ${plan.removeWorktree}`);
  }
  if (!skipRemote) {
    git(mainPath, ["checkout", "main"]);
    git(mainPath, ["pull", "--ff-only"]);
    report.push("main updated");
  }
  git(mainPath, ["branch", "-D", branch]);
  report.push(`branch ${branch}`);
  if (!skipRemote) {
    git(mainPath, ["fetch", "--prune", "origin"]);
  }
  console.log(`wt-cleanup: removed ${report.join(", ")}`);
  return 0;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`wt-cleanup: ${error.stderr?.toString().trim() || error.message}`);
    process.exitCode = 1;
  }
}
