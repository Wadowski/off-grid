// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(ROOT, "scripts", "release-manifest.mjs");
const SERVER_DIGEST = `sha256:${"a".repeat(64)}`;
const WEB_DIGEST = `sha256:${"c".repeat(64)}`;
const COMMIT = "b".repeat(40);

const tempDirs = [];
after(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

const makeDir = () => {
  const dir = mkdtempSync(join(tmpdir(), "release-manifest-"));
  tempDirs.push(dir);
  return dir;
};

const validEnv = (overrides = {}) => ({
  PATH: process.env.PATH,
  GITHUB_REPOSITORY_OWNER: "Wadowski",
  OFFGRID_RELEASE_VERSION: "1.2.3",
  OFFGRID_RELEASE_COMMIT: COMMIT,
  OFFGRID_SERVER_DIGEST: SERVER_DIGEST,
  OFFGRID_WEB_DIGEST: WEB_DIGEST,
  ...overrides,
});

const runGenerator = ({ env, minimum = "1.0.0\n" }) => {
  const dir = makeDir();
  const minimumFile = join(dir, "MINIMUM_UPDATE_FROM");
  const outPath = join(dir, "release-manifest.json");
  writeFileSync(minimumFile, minimum);
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", SCRIPT, "--out", outPath, "--minimum-file", minimumFile],
    { cwd: ROOT, env, encoding: "utf8" },
  );
  return { result, outPath };
};

describe("release manifest generator", () => {
  it("writes the manifest with both images referenced by digest", () => {
    const { result, outPath } = runGenerator({ env: validEnv() });

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(readFileSync(outPath, "utf8")), {
      schemaVersion: 1,
      version: "1.2.3",
      commit: COMMIT,
      images: {
        server: {
          reference: `ghcr.io/wadowski/offgrid-main-server@${SERVER_DIGEST}`,
          platforms: ["linux/amd64", "linux/arm64"],
        },
        web: {
          reference: `ghcr.io/wadowski/offgrid-main-web@${WEB_DIGEST}`,
          platforms: ["linux/amd64", "linux/arm64"],
        },
      },
      minimumPreviousVersion: "1.0.0",
    });
  });

  it("lowercases the owner in image references", () => {
    const { result, outPath } = runGenerator({
      env: validEnv({ GITHUB_REPOSITORY_OWNER: "MixedCase" }),
    });

    assert.equal(result.status, 0, result.stderr);
    const manifest = JSON.parse(readFileSync(outPath, "utf8"));
    assert.match(manifest.images.server.reference, /^ghcr\.io\/mixedcase\//);
  });

  it("refuses a version with a v prefix and writes no file", () => {
    const { result, outPath } = runGenerator({
      env: validEnv({ OFFGRID_RELEASE_VERSION: "v1.2.3" }),
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /version/);
    assert.equal(existsSync(outPath), false);
  });

  it("refuses a digest that is not a sha256 digest and writes no file", () => {
    const { result, outPath } = runGenerator({
      env: validEnv({ OFFGRID_WEB_DIGEST: "sha256:not-a-digest" }),
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /images\.web\.reference/);
    assert.equal(existsSync(outPath), false);
  });

  it("refuses a missing digest and writes no file", () => {
    const env = validEnv();
    delete env.OFFGRID_SERVER_DIGEST;
    const { result, outPath } = runGenerator({ env });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /OFFGRID_SERVER_DIGEST is required/);
    assert.equal(existsSync(outPath), false);
  });

  it("refuses a minimum previous version greater than the version and writes no file", () => {
    const { result, outPath } = runGenerator({ env: validEnv(), minimum: "1.3.0\n" });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /minimumPreviousVersion/);
    assert.equal(existsSync(outPath), false);
  });
});
