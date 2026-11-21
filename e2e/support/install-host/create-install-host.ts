// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { runDocker } from "../release-source/run-docker.js";
import { INSTALL_PROJECT_PREFIX } from "./constants.js";
import { ensureInstallHostImage } from "./ensure-install-host-image.js";
import { installHostArguments } from "./install-host-arguments.js";
import type { InstallHostKind, InstallWorld } from "./types.js";

export const createInstallHost = async (kind: InstallHostKind): Promise<InstallWorld> => {
  await ensureInstallHostImage();
  const project = `${INSTALL_PROJECT_PREFIX}-${randomBytes(4).toString("hex")}`;
  const containerName = `${project}-host`;
  await runDocker(installHostArguments(kind, containerName, project));
  return { project, containerName };
};
