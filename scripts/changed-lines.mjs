// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

const git = (root, args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

const tryGit = (root, args) => {
  try {
    return git(root, args).trim();
  } catch {
    return null;
  }
};

export const repoRoot = (cwd = process.cwd()) =>
  execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" }).trim();

export const commonDir = (root) =>
  resolve(root, git(root, ["rev-parse", "--git-common-dir"]).trim());

export const resolveBase = (root) => {
  if (process.env.BASE_REF) return process.env.BASE_REF;
  return tryGit(root, ["rev-parse", "--verify", "origin/main"]) ? "origin/main" : "main";
};

export const parseChangedLines = (diffText) => {
  const result = new Map();
  let current = null;
  for (const line of diffText.split("\n")) {
    if (line.startsWith("+++ ")) {
      const path = line.slice(4);
      current = path === "/dev/null" ? null : path.replace(/^b\//, "");
      if (current && !result.has(current)) result.set(current, new Set());
      continue;
    }
    const hunk = HUNK_HEADER.exec(line);
    if (hunk && current) {
      const start = Number(hunk[1]);
      const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      for (let offset = 0; offset < count; offset += 1) result.get(current).add(start + offset);
    }
  }
  return result;
};

const allLines = (root, path) => {
  const total = readFileSync(join(root, path), "utf8").split("\n").length;
  return new Set(Array.from({ length: total }, (_, index) => index + 1));
};

export const changedLineMap = (root, base = resolveBase(root)) => {
  const mergeBase = tryGit(root, ["merge-base", base, "HEAD"]) ?? base;
  const diff = git(root, [
    "diff",
    "-U0",
    "--no-color",
    "--no-ext-diff",
    "--diff-filter=d",
    mergeBase,
  ]);
  const result = parseChangedLines(diff);
  const untracked = git(root, ["ls-files", "--others", "--exclude-standard"]).split("\n");
  for (const path of untracked.filter(Boolean)) {
    try {
      result.set(path, allLines(root, path));
    } catch {
      continue;
    }
  }
  return result;
};

export const changedFiles = (root, base = resolveBase(root)) => [
  ...changedLineMap(root, base).keys(),
];
