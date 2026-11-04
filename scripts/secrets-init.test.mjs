// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../infra/compose/secrets-init.sh", import.meta.url));
const SECRET_FILES = [
  "app-password",
  "instance-id",
  "mail-encryption-key",
  "migrator-password",
  "postgres-password",
];

function runSecretsInit(secretsDir) {
  execFileSync("sh", [SCRIPT], { env: { ...process.env, SECRETS_DIR: secretsDir } });
}

function withSecretsDir(run) {
  const root = mkdtempSync(join(tmpdir(), "offgrid-secrets-"));
  try {
    return run(join(root, "secrets"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("creates every secret as a non-empty read-only file", () => {
  withSecretsDir((secretsDir) => {
    runSecretsInit(secretsDir);

    assert.deepEqual(readdirSync(secretsDir).sort(), SECRET_FILES);
    for (const name of SECRET_FILES) {
      const path = join(secretsDir, name);
      assert.ok(readFileSync(path, "utf8").length > 0, `${name} is empty`);
      assert.equal(statSync(path).mode & 0o777, 0o444, `${name} has the wrong mode`);
    }
  });
});

test("keeps existing secret values when run again", () => {
  withSecretsDir((secretsDir) => {
    runSecretsInit(secretsDir);
    const before = SECRET_FILES.map((name) => readFileSync(join(secretsDir, name), "utf8"));

    runSecretsInit(secretsDir);
    const after = SECRET_FILES.map((name) => readFileSync(join(secretsDir, name), "utf8"));

    assert.deepEqual(after, before);
  });
});
