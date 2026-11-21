// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { runDocker } from "../release-source/run-docker.js";
import { INSTALL_HOST_IMAGE } from "./constants.js";
import { installHostDockerfile } from "./install-host-dockerfile.js";

export const ensureInstallHostImage = async (): Promise<void> => {
  await runDocker(["build", "--quiet", "--tag", INSTALL_HOST_IMAGE, "-"], installHostDockerfile());
};
