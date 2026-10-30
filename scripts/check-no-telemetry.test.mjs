// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

import { checkNoTelemetry } from "./check-no-telemetry.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DENYLIST = readFileSync(join(REPO, "scripts/telemetry-denylist.json"), "utf8");

const CLEAN_LOCKFILE = `lockfileVersion: '9.0'

importers:

  apps/main-server:
    dependencies:
      fastify:
        specifier: ^5.0.0
        version: 5.0.0

packages:

  fastify@5.0.0:
    resolution: {integrity: sha512-x}

  '@types/node@24.0.0':
    resolution: {integrity: sha512-y}

snapshots:

  fastify@5.0.0: {}
`;

const CLEAN_SOURCE = 'import Fastify from "fastify";\nexport const app = Fastify();\n';

function withLockfileEntry(name) {
  return CLEAN_LOCKFILE.replace(
    "packages:\n",
    `packages:\n\n  '${name}':\n    resolution: {integrity: sha512-z}\n`,
  );
}

describe("checkNoTelemetry", () => {
  let root;

  const write = (relPath, content) => {
    mkdirSync(dirname(join(root, relPath)), { recursive: true });
    writeFileSync(join(root, relPath), content);
  };

  const reset = (files) => {
    if (root) rmSync(root, { recursive: true, force: true });
    root = mkdtempSync(join(tmpdir(), "og-39-telemetry-"));
    write("scripts/telemetry-denylist.json", DENYLIST);
    write("pnpm-lock.yaml", CLEAN_LOCKFILE);
    write("apps/main-server/src/index.ts", CLEAN_SOURCE);
    for (const [relPath, content] of Object.entries(files)) write(relPath, content);
  };

  after(() => rmSync(root, { recursive: true, force: true }));

  it("passes a clean fixture", () => {
    reset({});
    assert.deepEqual(checkNoTelemetry(root), []);
  });

  it("fails when the lockfile resolves a denylisted package", () => {
    reset({ "pnpm-lock.yaml": withLockfileEntry("posthog-js@1.2.3") });
    const violations = checkNoTelemetry(root);
    assert.equal(violations.length, 1);
    assert.equal(violations[0].file, "pnpm-lock.yaml");
    assert.match(violations[0].message, /posthog-js/);
  });

  it("matches scoped packages by their scope wildcard", () => {
    reset({ "pnpm-lock.yaml": withLockfileEntry("@sentry/node@8.0.0") });
    const violations = checkNoTelemetry(root);
    assert.equal(violations.length, 1);
    assert.match(violations[0].message, /@sentry\/node/);
  });

  it("fails when source imports a denylisted package", () => {
    reset({ "modules/notes/src/track.ts": 'import * as Sentry from "@sentry/browser";\n' });
    const violations = checkNoTelemetry(root);
    assert.equal(violations.length, 1);
    assert.equal(violations[0].file, "modules/notes/src/track.ts");
    assert.match(violations[0].message, /@sentry\/browser/);
  });

  it("fails when source calls a telemetry host, including subdomains", () => {
    reset({
      "packages/ui/src/beacon.ts": 'fetch("https://o123.ingest.sentry.io/api/1/envelope/");\n',
    });
    const violations = checkNoTelemetry(root);
    assert.equal(violations.length, 1);
    assert.equal(violations[0].file, "packages/ui/src/beacon.ts");
    assert.match(violations[0].message, /ingest\.sentry\.io/);
  });

  it("ignores denylist names that only appear in documentation", () => {
    reset({ "docs/notes.md": "We never use Sentry or https://sentry.io here.\n" });
    assert.deepEqual(checkNoTelemetry(root), []);
  });

  it("allows a denylisted package that has a documented exception", () => {
    reset({
      "scripts/telemetry-denylist.json": JSON.stringify({
        packages: ["posthog-js"],
        hosts: [],
        exceptions: [{ name: "posthog-js", reason: "Test fixture for the exception path." }],
      }),
      "pnpm-lock.yaml": withLockfileEntry("posthog-js@1.2.3"),
    });
    assert.deepEqual(checkNoTelemetry(root), []);
  });

  it("refuses an exception without a reason", () => {
    reset({
      "scripts/telemetry-denylist.json": JSON.stringify({
        packages: ["posthog-js"],
        hosts: [],
        exceptions: [{ name: "posthog-js", reason: "  " }],
      }),
    });
    assert.throws(() => checkNoTelemetry(root), /posthog-js.*needs a reason/);
  });
});

describe("repository", () => {
  it("has no telemetry packages or hosts", () => {
    assert.deepEqual(checkNoTelemetry(REPO), []);
  });
});
