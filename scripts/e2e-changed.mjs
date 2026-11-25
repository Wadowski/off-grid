#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { changedFiles, repoRoot, resolveBase } from "./changed-lines.mjs";
import { CONSUMERS } from "./e2e-affected.mjs";
import { buildManifest } from "./ui-screens.mjs";

const PNPM_E2E = ["--filter", "@offgrid/e2e", "exec"];

const FEATURE_PATH = /^e2e\/features\/.+\.feature$/;
const STEP_PATH = /^e2e\/steps\/(.+)\.steps\.ts$/;
const BACKEND_PATH = /^modules\/([a-z-]+)\//;
const UI_PAGE_PATH = /^apps\/main-web\/src\/pages\/([a-z-]+)-page\//;
const UI_MODULE_PATH = /^apps\/main-web\/src\/([a-z-]+)\//;
const FORM_PATH = /^apps\/main-web\/src\/forms\/([a-z-]+)\//;
// Catalog text only changes strings; the scenarios that render them follow the components.
const TEXT_PATH = /^apps\/main-web\/src\/i18n\//;
// Documentation and agent configuration run no scenario.
const NO_SCENARIO_PATH = /^(docs\/|\.claude\/|[^/]+\.md$)/;
// Repo tooling is tested by `pnpm test:scripts`, not by the scenarios it runs.
const TOOLING_PATH = /^scripts\//;
const MODULE_TAG = /@module:([a-z-]+)/g;
const FEATURE_TITLE = /^Feature:\s*(.+)$/m;

const escapePattern = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const withConsumers = (name) => [name, ...(CONSUMERS[name] ?? [])];

// Pure planner. `ctx` supplies the file-system facts:
//   knownModules          -> Set of module names
//   featuresForStep(name) -> feature paths named after a steps file
//   importersOf(name)     -> files under apps/main-web/src that import forms/<name>
export const planChanged = (files, ctx) => {
  const direct = new Set();
  const uiModules = new Set();
  const backendModules = new Set();
  const reasons = [];
  let fullReason = null;

  const addBackend = (name) => withConsumers(name).forEach((m) => backendModules.add(m));
  const uiModuleOf = (file) => {
    const page = UI_PAGE_PATH.exec(file);
    if (page) return page[1];
    const module = UI_MODULE_PATH.exec(file);
    return module && ctx.knownModules.has(module[1]) ? module[1] : null;
  };

  for (const file of files) {
    if (NO_SCENARIO_PATH.test(file)) continue;

    if (FEATURE_PATH.test(file)) {
      direct.add(file);
      continue;
    }

    const step = STEP_PATH.exec(file);
    if (step) {
      const features = ctx.featuresForStep(step[1]);
      if (features.length > 0) {
        features.forEach((feature) => direct.add(feature));
      } else if (ctx.knownModules.has(step[1])) {
        addBackend(step[1]);
      } else {
        fullReason = `${file} is a steps file with no matching feature`;
      }
      continue;
    }

    const backend = BACKEND_PATH.exec(file);
    if (backend) {
      addBackend(backend[1]);
      continue;
    }

    const ui = uiModuleOf(file);
    if (ui) {
      uiModules.add(ui);
      continue;
    }

    const form = FORM_PATH.exec(file);
    if (form) {
      const mapped = ctx.importersOf(form[1]).map(uiModuleOf);
      if (mapped.length === 0 || mapped.includes(null)) {
        fullReason = `${file} is used outside a known module`;
      } else {
        mapped.forEach((m) => uiModules.add(m));
        reasons.push(`${file} is used by ${[...new Set(mapped)].join(", ")}`);
      }
      continue;
    }

    if (file === "package.json" && ctx.onlyScriptsChanged?.(file)) {
      reasons.push("package.json changes scripts only; no scenario depends on them");
      continue;
    }

    if (TOOLING_PATH.test(file)) {
      reasons.push(`${file} is repo tooling; covered by pnpm test:scripts`);
      continue;
    }

    if (TEXT_PATH.test(file)) {
      reasons.push(`${file} changes text only; scenarios follow the components that render it`);
      continue;
    }

    fullReason = `${file} is shared code or an unknown path`;
  }

  if (fullReason) {
    return {
      mode: "full",
      directFeatures: [],
      uiModules: [],
      backendModules: [],
      reasons: [fullReason],
    };
  }
  const mode = direct.size + uiModules.size + backendModules.size === 0 ? "none" : "scoped";
  return {
    mode,
    directFeatures: [...direct].sort(),
    uiModules: [...uiModules].sort(),
    backendModules: [...backendModules].sort(),
    reasons,
  };
};

// Playwright matches --grep against the full test title, which carries the feature's
// tags (for example "@module:files @ui"). A changed feature file runs whole, matched
// by its Feature: title.
export const grepFor = (plan, featureTitle) => {
  if (plan.mode !== "scoped") return null;
  const parts = plan.directFeatures.map((feature) => escapePattern(featureTitle(feature)));
  if (plan.uiModules.length > 0) {
    parts.push(`(?=.*@module:(${plan.uiModules.join("|")})\\b)(?=.*@ui\\b)`);
  }
  if (plan.backendModules.length > 0) {
    parts.push(`@module:(${plan.backendModules.join("|")})\\b`);
  }
  return parts.join("|");
};

const walkFeatures = (root, dir) =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return walkFeatures(root, path);
    return entry.name.endsWith(".feature") ? [path] : [];
  });

const realContext = (root, base) => {
  const features = walkFeatures(root, "e2e/features");
  const contentOf = (path) => readFileSync(join(root, path), "utf8");
  // True when the manifest differs from the base only in its `scripts` block.
  const onlyScriptsChanged = (path) => {
    try {
      const before = JSON.parse(
        execFileSync("git", ["show", `${base}:${path}`], { cwd: root, encoding: "utf8" }),
      );
      const after = JSON.parse(contentOf(path));
      const withoutScripts = (manifest) => {
        const copy = { ...manifest };
        delete copy.scripts;
        return JSON.stringify(copy);
      };
      return withoutScripts(before) === withoutScripts(after);
    } catch {
      return false;
    }
  };
  const modulesOf = (path) => [...contentOf(path).matchAll(MODULE_TAG)].map((m) => m[1]);
  const knownModules = new Set(
    readdirSync(join(root, "modules"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name),
  );
  features.forEach((path) => modulesOf(path).forEach((m) => knownModules.add(m)));
  return {
    knownModules,
    onlyScriptsChanged,
    featureTitle: (path) => contentOf(path).match(FEATURE_TITLE)?.[1].trim() ?? path,
    featuresForStep: (name) => features.filter((path) => path.endsWith(`/${name}.feature`)),
    importersOf: (name) => {
      try {
        const out = execFileSync(
          "git",
          ["grep", "-l", "-E", `forms/${name}["'/]`, "--", "apps/main-web/src"],
          { cwd: root, encoding: "utf8" },
        );
        return out
          .split("\n")
          .filter(Boolean)
          .filter((path) => !/\.test\.tsx?$/.test(path))
          .filter((path) => !path.startsWith(`apps/main-web/src/forms/${name}/`));
      } catch {
        return [];
      }
    },
  };
};

const describePlan = (plan, grep) => {
  const lines = [`e2e-changed: ${plan.mode}`];
  if (plan.directFeatures.length) {
    lines.push(`  changed feature files (whole file): ${plan.directFeatures.join(", ")}`);
  }
  if (plan.uiModules.length) {
    lines.push(`  @ui scenarios of modules: ${plan.uiModules.join(", ")}`);
  }
  if (plan.backendModules.length) {
    lines.push(`  all scenarios of modules: ${plan.backendModules.join(", ")}`);
  }
  for (const reason of plan.reasons) lines.push(`  note: ${reason}`);
  if (plan.mode === "full")
    lines.push("  full run: no narrower selection is safe for these changes");
  if (grep) lines.push(`  grep: ${grep}`);
  return lines.join("\n");
};

const runPlaywright = (root, grep, env) => {
  const bdd = spawnSync("pnpm", [...PNPM_E2E, "bddgen"], { cwd: root, stdio: "inherit" });
  if (bdd.status !== 0) return bdd.status ?? 1;
  const selection = grep ? ["--grep", grep] : [];
  return (
    spawnSync(
      "pnpm",
      [...PNPM_E2E, "playwright", "test", "--grep-invert", "@wip", "--trace", "off", ...selection],
      { cwd: root, stdio: "inherit", env: { ...process.env, ...env } },
    ).status ?? 1
  );
};

// `--screens` runs the same selection with screenshots on, then writes the manifest and
// contact sheets. Screens are limited to @ui scenarios; the plan never widens them.
const main = async () => {
  const root = repoRoot();
  const screens = process.argv.includes("--screens");
  const base = resolveBase(root);
  const ctx = realContext(root, base);
  const plan = planChanged(changedFiles(root, base), ctx);
  const grep = grepFor(plan, ctx.featureTitle);
  console.log(describePlan(plan, grep));
  if (process.argv.includes("--dry-run")) return 0;
  if (plan.mode === "none") {
    console.log("e2e-changed: no scenario is affected by these changes; nothing to run");
    return 0;
  }
  const screenGrep = screens && grep === null ? "@ui" : grep;
  const startedAt = Date.now() - 1000;
  const status = runPlaywright(root, screenGrep, screens ? { E2E_SCREENSHOTS: "1" } : {});
  if (status !== 0 || !screens) return status;
  await buildManifest(root, { grep: screenGrep, startedAt });
  return 0;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main();
}
