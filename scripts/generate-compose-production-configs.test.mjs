// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(ROOT, "scripts", "generate-compose-production-configs.mjs");
const PRODUCTION_FILE = join(ROOT, "infra", "compose", "docker-compose.production.yml");

const runGenerator = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });

const temporaryCopy = () => {
  const directory = mkdtempSync(join(tmpdir(), "og169-generate-"));
  const file = join(directory, "docker-compose.production.yml");
  copyFileSync(PRODUCTION_FILE, file);
  return file;
};

describe("generate compose production configs", () => {
  it("keeps the committed production file in sync with the repo init sources", () => {
    const result = runGenerator(["--check"]);

    assert.equal(result.status, 0, "run node scripts/generate-compose-production-configs.mjs to refresh the configs block");
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
  });

  it("exits 1 silently when the file differs from the generated output", () => {
    const file = temporaryCopy();
    writeFileSync(file, readFileSync(file, "utf8").replace("content: |", "content: |\n      drift"));

    const result = runGenerator(["--check", "--file", file]);

    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
  });

  it("rewrites the configs block so that --check passes again", () => {
    const file = temporaryCopy();
    writeFileSync(file, readFileSync(file, "utf8").replace(/\nconfigs:\n[\s\S]*$/, "\nconfigs:\n  stale:\n    content: |\n      old\n"));

    assert.equal(runGenerator(["--check", "--file", file]).status, 1);
    assert.equal(runGenerator(["--file", file]).status, 0);
    assert.equal(runGenerator(["--check", "--file", file]).status, 0);
  });

  it("escapes every dollar sign of the inlined shell script for Compose", () => {
    const committed = readFileSync(PRODUCTION_FILE, "utf8");

    assert.match(committed, /secrets_dir=\$\$\{SECRETS_DIR:-\/data\/secrets\}/);
    assert.doesNotMatch(committed, /(^|[^$])\$\{SECRETS_DIR/m);
  });

  it("strips the REUSE header from inlined content", () => {
    const configsSection = readFileSync(PRODUCTION_FILE, "utf8").split("\nconfigs:\n")[1];

    assert.doesNotMatch(configsSection, /SPDX-FileCopyrightText/);
  });

  it("refuses a production file without a configs key", () => {
    const file = temporaryCopy();
    writeFileSync(file, "name: offgrid\n");

    const result = runGenerator(["--file", file]);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /configs/);
  });
});
