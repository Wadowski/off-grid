// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createBdd } from "playwright-bdd";
import { expect, test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const REPO_ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const GENERATOR = join(REPO_ROOT, "scripts", "release-manifest.mjs");
const MINIMUM_FILE = join(REPO_ROOT, "MINIMUM_UPDATE_FROM");
const SERVER_REFERENCE = /^ghcr\.io\/[a-z0-9-]+\/offgrid-main-server@sha256:[0-9a-f]{64}$/;
const WEB_REFERENCE = /^ghcr\.io\/[a-z0-9-]+\/offgrid-main-web@sha256:[0-9a-f]{64}$/;

type ReleaseManifestFile = {
  version: string;
  minimumPreviousVersion: string;
  images: { server: { reference: string }; web: { reference: string } };
};

const digestOf = (imageName: string): string =>
  `sha256:${createHash("sha256").update(imageName).digest("hex")}`;

const readManifest = (outPath: string): ReleaseManifestFile => {
  expect(existsSync(outPath), "no release manifest was written").toBe(true);
  return JSON.parse(readFileSync(outPath, "utf8"));
};

Given("a release {string} has been built with its server and web images", ({ world }, version) => {
  world.releaseBuild = {
    version,
    serverDigest: digestOf("offgrid-main-server"),
    webDigest: digestOf("offgrid-main-web"),
  };
});

Given(
  "a release {string} has been built with its server image but no web image digest",
  ({ world }, version) => {
    world.releaseBuild = { version, serverDigest: digestOf("offgrid-main-server") };
  },
);

When("the release manifest is generated", ({ world }) => {
  const build = world.releaseBuild;
  expect(build, "no release build was recorded").toBeDefined();
  const outDir = test.info().outputDir;
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "release-manifest.json");
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", GENERATOR, "--out", outPath, "--minimum-file", MINIMUM_FILE],
    {
      cwd: REPO_ROOT,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        GITHUB_REPOSITORY_OWNER: "offgrid-release",
        OFFGRID_RELEASE_VERSION: build?.version,
        OFFGRID_RELEASE_COMMIT: "0".repeat(40),
        OFFGRID_SERVER_DIGEST: build?.serverDigest,
        OFFGRID_WEB_DIGEST: build?.webDigest,
      },
    },
  );
  world.releaseManifestRun = {
    exitCode: result.status ?? -1,
    stderr: result.stderr,
    outPath,
  };
});

Then("the manifest belongs to version {string}", ({ world }, version) => {
  const run = world.releaseManifestRun;
  expect(run?.exitCode, run?.stderr).toBe(0);
  expect(readManifest(run!.outPath).version).toBe(version);
});

Then("the manifest names the server and web images by digest", ({ world }) => {
  const run = world.releaseManifestRun;
  expect(run?.exitCode, run?.stderr).toBe(0);
  const manifest = readManifest(run!.outPath);
  expect(manifest.images.server.reference).toMatch(SERVER_REFERENCE);
  expect(manifest.images.web.reference).toMatch(WEB_REFERENCE);
});

Then("the manifest states the oldest version that can update to it", ({ world }) => {
  const run = world.releaseManifestRun;
  expect(run?.exitCode, run?.stderr).toBe(0);
  const minimum = readFileSync(MINIMUM_FILE, "utf8").trim();
  expect(readManifest(run!.outPath).minimumPreviousVersion).toBe(minimum);
  expect(minimum).toMatch(/^\d+\.\d+\.\d+$/);
});

Then("the release manifest is refused", ({ world }) => {
  const run = world.releaseManifestRun;
  expect(run?.exitCode, "the release manifest was accepted").toBe(1);
  expect(existsSync(run!.outPath), "a refused release manifest was written").toBe(false);
});
