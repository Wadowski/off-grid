// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { FAKE_IMAGE_OWNER, MANIFEST_IMAGE_HOST, RELEASES_FOLDER } from "./constants.js";
import { buildReleaseManifest } from "./build-release-manifest.js";
import { customizeEnvironmentExample } from "./customize-environment-example.js";
import { sha256Of } from "./sha256-of.js";
import type { PushedImages } from "./types.js";

const COMPOSE_FOLDER = fileURLToPath(new URL("../../../infra/compose/", import.meta.url));

export const writeReleaseFiles = async (
  directory: string,
  version: string,
  digests: PushedImages,
  registryPort: string,
): Promise<void> => {
  const folder = join(directory, RELEASES_FOLDER, version);
  await mkdir(folder, { recursive: true });
  const compose = (
    await readFile(join(COMPOSE_FOLDER, "docker-compose.production.yml"), "utf8")
  ).replaceAll(
    `${MANIFEST_IMAGE_HOST}/\${OFFGRID_IMAGE_OWNER:-wadowski}`,
    `127.0.0.1:${registryPort}/${FAKE_IMAGE_OWNER}`,
  );
  const environmentExample = customizeEnvironmentExample(
    await readFile(join(COMPOSE_FOLDER, "production.env.example"), "utf8"),
  );
  await writeFile(join(folder, "release-manifest.json"), buildReleaseManifest(version, digests));
  await writeFile(join(folder, "docker-compose.production.yml"), compose);
  await writeFile(join(folder, "production.env.example"), environmentExample);
  await writeFile(
    join(folder, "SHA256SUMS"),
    `${sha256Of(compose)}  docker-compose.production.yml\n${sha256Of(environmentExample)}  production.env.example\n`,
  );
};
