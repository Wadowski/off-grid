#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { repoRoot } from "./changed-lines.mjs";
import { makeContactSheet, splitVariant } from "./ui-contact-sheet.mjs";

const UI_PATHS = ["apps/main-web", "packages/ui", "e2e/features", "e2e/steps", "e2e/support"];
const SCREENS_DIR = "e2e/artifacts/screens";
const MANIFEST = "manifest.json";

const git = (root, args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

export const uiFingerprint = (root, grep) => {
  const hash = createHash("sha1");
  hash.update(grep);
  hash.update(git(root, ["rev-parse", "HEAD"]));
  hash.update(git(root, ["diff", "HEAD", "--binary", "--no-ext-diff", "--", ...UI_PATHS]));
  const untracked = git(root, ["ls-files", "--others", "--exclude-standard", "--", ...UI_PATHS])
    .split("\n")
    .filter(Boolean);
  for (const path of untracked) {
    hash.update(path);
    hash.update(readFileSync(join(root, path)));
  }
  return hash.digest("hex");
};

export const groupScreens = (entries) => {
  const groups = new Map();
  for (const { feature, file } of entries) {
    if (file.endsWith("-sheet.png")) continue;
    const { screen, suffix } = splitVariant(file);
    const key = `${feature}/${screen}`;
    if (!groups.has(key)) groups.set(key, { feature, screen, variants: [] });
    groups.get(key).variants.push(suffix);
  }
  return [...groups.values()];
};

const listScreens = (dir, since) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((feature) => statSync(join(dir, feature)).isDirectory())
    .flatMap((feature) =>
      readdirSync(join(dir, feature))
        .filter((file) => file.endsWith(".png"))
        .filter((file) => statSync(join(dir, feature, file)).mtimeMs >= since)
        .map((file) => ({ feature, file })),
    );
};

const capture = (root, grep) => {
  const prefix = ["--filter", "@offgrid/e2e", "exec"];
  const bdd = spawnSync("pnpm", [...prefix, "bddgen"], { cwd: root, stdio: "inherit" });
  if (bdd.status !== 0) return bdd.status ?? 1;
  const run = spawnSync(
    "pnpm",
    [...prefix, "playwright", "test", "--grep", grep, "--grep-invert", "@wip", "--trace", "off"],
    { cwd: root, stdio: "inherit", env: { ...process.env, E2E_SCREENSHOTS: "1" } },
  );
  return run.status ?? 1;
};

const main = async () => {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const grepIndex = args.indexOf("--grep");
  const grep = grepIndex >= 0 ? args[grepIndex + 1] : "@ui";
  const root = repoRoot();
  const dir = join(root, SCREENS_DIR);
  const manifestFile = join(dir, MANIFEST);
  const fingerprint = uiFingerprint(root, grep);
  if (!force && existsSync(manifestFile)) {
    const cached = JSON.parse(readFileSync(manifestFile, "utf8"));
    if (cached.fingerprint === fingerprint) {
      console.log(
        `ui-screens: reusing ${cached.screens.length} screens captured on this exact tree`,
      );
      console.log(manifestFile);
      return 0;
    }
  }
  const startedAt = Date.now() - 1000;
  const status = capture(root, grep);
  if (status !== 0) {
    console.error("ui-screens: the @ui scenarios failed; no manifest written");
    return status;
  }
  const screens = groupScreens(listScreens(dir, startedAt));
  for (const entry of screens) {
    entry.sheet = await makeContactSheet(root, join(dir, entry.feature), entry.screen);
  }
  writeFileSync(manifestFile, JSON.stringify({ fingerprint, grep, screens }, null, 2));
  console.log(`ui-screens: captured ${screens.length} screens`);
  for (const entry of screens) console.log(`  ${entry.feature}/${entry.screen}: ${entry.sheet}`);
  console.log(manifestFile);
  return 0;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main();
}
