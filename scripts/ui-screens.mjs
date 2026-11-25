// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeContactSheet, splitVariant } from "./ui-contact-sheet.mjs";

export const SCREENS_DIR = "e2e/artifacts/screens";
const MANIFEST = "manifest.json";

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

export const buildManifest = async (root, { grep, startedAt }) => {
  const dir = join(root, SCREENS_DIR);
  const screens = groupScreens(listScreens(dir, startedAt));
  for (const entry of screens) {
    entry.sheet = await makeContactSheet(root, join(dir, entry.feature), entry.screen);
  }
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const manifestFile = join(dir, MANIFEST);
  writeFileSync(manifestFile, JSON.stringify({ commit: head, grep, screens }, null, 2));
  console.log(`e2e-changed --screens: captured ${screens.length} screens`);
  for (const entry of screens) console.log(`  ${entry.feature}/${entry.screen}: ${entry.sheet}`);
  console.log(manifestFile);
  return screens.length;
};
