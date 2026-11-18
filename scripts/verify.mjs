#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { changedFiles, commonDir, repoRoot, resolveBase } from "./changed-lines.mjs";

const OUTPUT_LIMIT = 3000;
const CONCURRENCY = 4;
const EXCLUSIVE = new Set(["test", "build"]);

export const planChecks = (files) => {
  const touches = (pattern) => files.some((file) => pattern.test(file));
  const checks = [
    ["lint", ["lint"]],
    ["typecheck", ["typecheck"]],
    ["format", ["format:check"]],
    ["test", ["test"]],
    ["boundaries", ["check:boundaries"]],
    ["agent-config", ["check:agent-config"]],
    ["no-telemetry", ["check:no-telemetry"]],
    ["headers", ["license:headers:check"]],
    ["dco", ["dco:check"]],
    ["wip-tags", ["check:wip-tags"]],
    ["rules", ["check:rules"]],
  ];
  if (touches(/\.feature$/)) checks.push(["features", ["lint:features"]]);
  if (touches(/^packages\/contracts\//)) checks.push(["contracts", ["check:contracts"]]);
  if (touches(/^(packages|apps)\//)) checks.push(["build", ["build"]]);
  if (touches(/^infra\/compose\/|^scripts\/check-compose-/))
    checks.push(["compose", ["check:compose"]]);
  return checks;
};

const gitText = (root, args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

export const fingerprint = (root) => {
  const hash = createHash("sha1");
  hash.update(gitText(root, ["rev-parse", "HEAD"]));
  hash.update(gitText(root, ["diff", "HEAD", "--binary", "--no-ext-diff"]));
  const untracked = gitText(root, ["ls-files", "--others", "--exclude-standard"])
    .split("\n")
    .filter(Boolean);
  for (const path of untracked) {
    hash.update(path);
    hash.update(readFileSync(join(root, path)));
  }
  return hash.digest("hex");
};

export const readStamp = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return { fingerprint: null, passed: [] };
  }
};

export const pendingChecks = (checks, stamp, current) =>
  stamp.fingerprint === current ? checks.filter(([name]) => !stamp.passed.includes(name)) : checks;

const tail = (text) => (text.length > OUTPUT_LIMIT ? `...${text.slice(-OUTPUT_LIMIT)}` : text);

const runCheck = ([name, args], root) =>
  new Promise((resolve) => {
    const child = spawn("pnpm", args, {
      cwd: root,
      env: { ...process.env, CI: "1", FORCE_COLOR: "0" },
    });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("error", (error) => resolve({ name, ok: false, output: String(error) }));
    child.on("close", (code) => resolve({ name, ok: code === 0, output: output.trim() }));
  });

const runPool = async (checks, root, run) => {
  const results = [];
  const queue = [...checks];
  const worker = async () => {
    while (queue.length > 0) {
      results.push(await run(queue.shift(), root));
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, checks.length) }, worker));
  return results;
};

export const runAll = async (checks, root, run = runCheck) => {
  const light = checks.filter(([name]) => !EXCLUSIVE.has(name));
  const heavy = checks.filter(([name]) => EXCLUSIVE.has(name));
  const results = await runPool(light, root, run);
  for (const check of heavy) {
    results.push(await run(check, root));
  }
  return results;
};

const main = async () => {
  const root = repoRoot();
  const force = process.argv.includes("--force");
  const stampFile = join(commonDir(root), "verify-stamp.json");
  const current = fingerprint(root);
  const all = planChecks(changedFiles(root, resolveBase(root)));
  const stamp = force ? { fingerprint: null, passed: [] } : readStamp(stampFile);
  const pending = pendingChecks(all, stamp, current);
  if (pending.length === 0) {
    console.log(`verify: pass (cached, ${all.length} checks already passed on this exact tree)`);
    return 0;
  }
  const skipped = all.length - pending.length;
  console.log(
    `verify: running ${pending.map(([name]) => name).join(", ")}${skipped ? ` (${skipped} cached)` : ""}`,
  );
  const results = await runAll(pending, root);
  const carried = stamp.fingerprint === current ? stamp.passed : [];
  const passed = [...new Set([...carried, ...results.filter((r) => r.ok).map((r) => r.name)])];
  mkdirSync(commonDir(root), { recursive: true });
  writeFileSync(
    stampFile,
    JSON.stringify({ fingerprint: current, passed, at: new Date().toISOString() }),
  );
  const failed = results.filter((result) => !result.ok);
  if (failed.length === 0) {
    console.log(`verify: pass (${results.map((r) => r.name).join(", ")})`);
    return 0;
  }
  for (const result of failed) {
    console.error(`\n--- ${result.name} FAILED ---\n${tail(result.output)}`);
  }
  console.error(
    `\nverify: FAIL (${failed.map((r) => r.name).join(", ")}). Passed: ${passed.join(", ") || "none"}`,
  );
  return 1;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main();
}
