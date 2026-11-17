#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RELEASE_PLATFORMS, releaseManifestSchema } from "@offgrid/contracts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MINIMUM_FILE = join(ROOT, "MINIMUM_UPDATE_FROM");
const DEFAULT_OUT = "release-manifest.json";
const REGISTRY = "ghcr.io";

const argumentValue = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};

const requiredEnv = (name) => {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`${name} is required`);
  }
  return value;
};

const readMinimumPreviousVersion = (path) => readFileSync(path, "utf8").trim();

const imageReference = (owner, imageName, digest) =>
  `${REGISTRY}/${owner.toLowerCase()}/${imageName}@${digest}`;

const buildManifest = (minimumPreviousVersion) => {
  const owner = requiredEnv("GITHUB_REPOSITORY_OWNER");
  return {
    schemaVersion: 1,
    version: requiredEnv("OFFGRID_RELEASE_VERSION"),
    commit: requiredEnv("OFFGRID_RELEASE_COMMIT"),
    images: {
      server: {
        reference: imageReference(
          owner,
          "offgrid-main-server",
          requiredEnv("OFFGRID_SERVER_DIGEST"),
        ),
        platforms: [...RELEASE_PLATFORMS],
      },
      web: {
        reference: imageReference(owner, "offgrid-main-web", requiredEnv("OFFGRID_WEB_DIGEST")),
        platforms: [...RELEASE_PLATFORMS],
      },
    },
    minimumPreviousVersion,
  };
};

const describeIssues = (error) =>
  error.issues.map((issue) => `${issue.path.join(".") || "manifest"}: ${issue.message}`).join("\n");

const main = () => {
  const outPath = argumentValue("--out") ?? DEFAULT_OUT;
  const minimumFile = argumentValue("--minimum-file") ?? DEFAULT_MINIMUM_FILE;
  try {
    const minimumPreviousVersion = readMinimumPreviousVersion(minimumFile);
    const manifest = releaseManifestSchema.parse(buildManifest(minimumPreviousVersion));
    writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Wrote ${outPath} for version ${manifest.version}.`);
  } catch (error) {
    const message = error.issues ? describeIssues(error) : error.message;
    console.error(`release-manifest: ${message}`);
    process.exitCode = 1;
  }
};

main();
