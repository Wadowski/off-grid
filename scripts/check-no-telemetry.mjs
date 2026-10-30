#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = "scripts/telemetry-denylist.json";
const LOCKFILE_PATH = "pnpm-lock.yaml";
const SOURCE_DIRS = ["apps", "modules", "packages", "e2e", "scripts", "infra"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".html"]);
const SKIPPED_DIRS = new Set(["node_modules", "dist", "coverage", "test-results", ".turbo"]);
const CHECKER_FILES = new Set([
  "scripts/check-no-telemetry.mjs",
  "scripts/check-no-telemetry.test.mjs",
]);
const LOCKFILE_SECTIONS = new Set(["packages", "snapshots"]);
const LOCKFILE_KEY = /^ {2}'?(@?[^@'\s][^@'\s]*)@[^'\s]*'?:$/;
const TOP_LEVEL_KEY = /^([a-zA-Z]+):/;
const IMPORT_SPECIFIER =
  /(?:\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)["']([^"']+)["']/g;
const URL_HOST = /\bhttps?:\/\/([a-z0-9.-]+)/gi;

function readConfig(root) {
  const config = JSON.parse(readFileSync(join(root, CONFIG_PATH), "utf8"));
  const exceptions = config.exceptions ?? [];
  for (const exception of exceptions) {
    if (typeof exception.name !== "string" || exception.name === "") {
      throw new Error(`${CONFIG_PATH}: every exception needs a "name"`);
    }
    if (typeof exception.reason !== "string" || exception.reason.trim() === "") {
      throw new Error(`${CONFIG_PATH}: exception "${exception.name}" needs a reason`);
    }
  }
  return {
    packages: config.packages ?? [],
    hosts: config.hosts ?? [],
    allowed: new Set(exceptions.map((exception) => exception.name)),
  };
}

function matchPackage(name, packages) {
  return packages.find((entry) =>
    entry.endsWith("/*") ? name.startsWith(entry.slice(0, -1)) : name === entry,
  );
}

function matchHost(hostname, hosts) {
  const lower = hostname.toLowerCase();
  return hosts.find((host) => lower === host || lower.endsWith(`.${host}`));
}

function packageNamesInLockfile(text) {
  const names = new Set();
  let section = null;
  for (const line of text.split("\n")) {
    const topLevel = TOP_LEVEL_KEY.exec(line);
    if (topLevel) {
      section = topLevel[1];
      continue;
    }
    const key = LOCKFILE_SECTIONS.has(section) ? LOCKFILE_KEY.exec(line) : null;
    if (key) names.add(key[1]);
  }
  return names;
}

function sourceFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIPPED_DIRS.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
  });
}

function packageNameOf(specifier) {
  if (specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith("node:")) {
    return null;
  }
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function violationsInLockfile(root, config) {
  const lockfilePath = join(root, LOCKFILE_PATH);
  if (!existsSync(lockfilePath)) return [];
  const text = readFileSync(lockfilePath, "utf8");
  return [...packageNamesInLockfile(text)]
    .sort()
    .filter((name) => matchPackage(name, config.packages) && !config.allowed.has(name))
    .map((name) => ({
      file: LOCKFILE_PATH,
      message: `resolved package ${name} is on the telemetry denylist (${matchPackage(name, config.packages)})`,
    }));
}

function violationsInSource(root, config) {
  return SOURCE_DIRS.flatMap((dir) => sourceFiles(join(root, dir))).flatMap((file) => {
    const where = relative(root, file);
    if (CHECKER_FILES.has(where)) return [];
    const text = readFileSync(file, "utf8");
    const packageViolations = [...text.matchAll(IMPORT_SPECIFIER)].flatMap(([, specifier]) => {
      const name = packageNameOf(specifier);
      const entry = name && matchPackage(name, config.packages);
      if (!entry || config.allowed.has(name)) return [];
      return [
        { file: where, message: `imports ${name}, which is on the telemetry denylist (${entry})` },
      ];
    });
    const hostViolations = [...text.matchAll(URL_HOST)].flatMap(([, hostname]) => {
      const entry = matchHost(hostname, config.hosts);
      if (!entry || config.allowed.has(entry)) return [];
      return [{ file: where, message: `calls telemetry host ${hostname} (${entry})` }];
    });
    return [...packageViolations, ...hostViolations];
  });
}

export function checkNoTelemetry(root = DEFAULT_ROOT) {
  const config = readConfig(root);
  return [...violationsInLockfile(root, config), ...violationsInSource(root, config)];
}

async function main() {
  const root = resolve(process.argv[2] ?? DEFAULT_ROOT);
  const violations = checkNoTelemetry(root);
  if (violations.length > 0) {
    for (const { file, message } of violations) console.error(`error: ${file}: ${message}`);
    console.error(
      `\n${violations.length} telemetry rule violation(s). A legitimate exception needs an entry with a reason in ${CONFIG_PATH}; see docs/privacy-guards.md.`,
    );
    process.exitCode = 1;
    return;
  }
  console.log("no telemetry packages or hosts found");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
