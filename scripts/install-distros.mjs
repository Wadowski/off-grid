#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DISTRO_IMAGES = ["debian:12", "fedora:41", "quay.io/centos/centos:stream9"];
const INSTALL_AND_CHECK = [
  "sh /src/infra/install/install.sh",
  "docker --version",
  "docker compose version",
].join(" && ");

const dockerRunArguments = (image) => [
  "run",
  "--rm",
  "-v",
  `${REPO_ROOT}:/src:ro`,
  image,
  "sh",
  "-c",
  INSTALL_AND_CHECK,
];

const requestedImages = process.argv.slice(2);
const images = requestedImages.length > 0 ? requestedImages : DISTRO_IMAGES;

const failedImages = images.filter((image) => {
  console.log(`install-distros: ${image}`);
  const result = spawnSync("docker", dockerRunArguments(image), { stdio: "inherit" });
  if (result.status === null) {
    const cause = result.error?.message ?? `stopped by signal ${result.signal}`;
    console.error(`install-distros: docker did not finish for ${image}: ${cause}`);
  }
  return result.status !== 0;
});

if (failedImages.length > 0) {
  console.error(`install-distros: FAIL (${failedImages.join(", ")})`);
  process.exitCode = 1;
} else {
  console.log(`install-distros: pass (${images.join(", ")})`);
}
