// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { rm } from "node:fs/promises";
import { dirname } from "node:path";
import { stopContainer } from "./stop-container.js";
import type { StartedSharedCluster } from "./types.js";

export const stopSharedCluster = async (
  cluster: StartedSharedCluster,
  connectionFilePath: string,
): Promise<void> => {
  await stopContainer(cluster.admin, cluster.container);
  await rm(dirname(connectionFilePath), { recursive: true, force: true });
};
