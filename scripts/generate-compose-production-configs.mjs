#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PRODUCTION_FILE = "infra/compose/docker-compose.production.yml";
const SQL_DIRECTORY = "infra/init/sql";
const SECRETS_SCRIPT = "infra/compose/secrets-init.sh";
const CONFIGS_MARKER = "\nconfigs:\n";
const REUSE_HEADER = /^(#|--) SPDX-/;
const INIT_FILE = /\.(sql|sh)$/;

const initSources = () =>
  readdirSync(join(ROOT, SQL_DIRECTORY))
    .filter((name) => INIT_FILE.test(name))
    .sort()
    .map((name) => ({ name: `init-${name}`, path: join(ROOT, SQL_DIRECTORY, name) }));

const sources = () => [
  ...initSources(),
  { name: "secrets-init.sh", path: join(ROOT, SECRETS_SCRIPT) },
];

const stripReuseHeader = (text) =>
  text
    .split("\n")
    .filter((line) => !REUSE_HEADER.test(line))
    .join("\n")
    .replace(/^\n+/, "");

const escapeForCompose = (text) => text.replaceAll("$", () => "$$");

const indentLine = (line) => (line === "" ? "" : `      ${line}`);

const renderEntry = ({ name, path }) => {
  const content = escapeForCompose(stripReuseHeader(readFileSync(path, "utf8")));
  const lines = content.replace(/\n$/, "").split("\n").map(indentLine);
  return [`  ${name}:`, "    content: |", ...lines].join("\n");
};

const renderConfigs = () => {
  const entries = sources().map(renderEntry);
  return `configs:\n${entries.join("\n")}\n`;
};

const generate = (productionText) => {
  const index = productionText.indexOf(CONFIGS_MARKER);
  if (index === -1) {
    throw new Error("the production compose file has no top-level configs key");
  }
  return productionText.slice(0, index + 1) + renderConfigs();
};

const optionValue = (argv, option) => {
  const position = argv.indexOf(option);
  if (position === -1) {
    return undefined;
  }
  const value = argv[position + 1];
  return value === undefined || value.startsWith("--") ? null : value;
};

const main = (argv) => {
  const override = optionValue(argv, "--file");
  if (override === null) {
    process.stderr.write("generate-compose-production-configs: --file needs a path\n");
    return 1;
  }
  const file = override ?? join(ROOT, PRODUCTION_FILE);
  const current = readFileSync(file, "utf8");
  const next = generate(current);
  if (argv.includes("--check")) {
    return next === current ? 0 : 1;
  }
  writeFileSync(file, next);
  return 0;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main(process.argv.slice(2));
}
