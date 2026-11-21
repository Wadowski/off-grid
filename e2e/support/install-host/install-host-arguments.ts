// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";
import { releaseSourceDirectory } from "../release-source/release-source-directory.js";
import { releaseSourcePort } from "../release-source/release-source-port.js";
import { FAKE_RELEASE_HOST_NAME, FAKE_RELEASE_REPOSITORY } from "../release-source/constants.js";
import {
  CONTAINER_FOLDER,
  FREEBSD_OS_RELEASE,
  INSTALL_DIRECTORY,
  INSTALL_HOST_IMAGE,
  INSTALL_SCRIPT_PATH,
} from "./constants.js";
import { installCommand } from "./install-command.js";
import type { InstallHostKind } from "./types.js";

export const installHostArguments = (
  kind: InstallHostKind,
  containerName: string,
  project: string,
): string[] => [
  "create",
  "--name",
  containerName,
  "--add-host",
  `${FAKE_RELEASE_HOST_NAME}:host-gateway`,
  "--volume",
  "/var/run/docker.sock:/var/run/docker.sock",
  "--volume",
  `${fileURLToPath(new URL(INSTALL_SCRIPT_PATH, import.meta.url))}:/e2e/install.sh:ro`,
  "--volume",
  `${fileURLToPath(new URL(CONTAINER_FOLDER, import.meta.url))}:/e2e/container:ro`,
  "--volume",
  `${releaseSourceDirectory()}/ca.pem:/e2e/ca.pem:ro`,
  "--env",
  `CURL_CA_BUNDLE=/e2e/ca.pem`,
  "--env",
  `OFFGRID_RELEASE_DOWNLOAD_BASE_URL=https://${FAKE_RELEASE_HOST_NAME}:${releaseSourcePort()}`,
  "--env",
  `OFFGRID_RELEASE_REPOSITORY=${FAKE_RELEASE_REPOSITORY}`,
  "--env",
  `OFFGRID_INSTALL_DIR=${INSTALL_DIRECTORY}`,
  "--env",
  `E2E_INSTALL_PROJECT=${project}`,
  ...(kind === "not-linux" ? ["--env", `OFFGRID_OS_RELEASE_FILE=${FREEBSD_OS_RELEASE}`] : []),
  INSTALL_HOST_IMAGE,
  "sh",
  "-c",
  installCommand(kind),
];
