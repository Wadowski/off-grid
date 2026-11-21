// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { runDocker } from "../release-source/run-docker.js";
import type { InstallWorld } from "./types.js";

export const removeInstallHost = async (install: InstallWorld): Promise<void> => {
  await runDocker(["rm", "--force", install.containerName]).catch(() => "");
  await runDocker([
    "compose",
    "--project-name",
    install.project,
    "down",
    "--volumes",
    "--remove-orphans",
  ]).catch(() => "");
};
