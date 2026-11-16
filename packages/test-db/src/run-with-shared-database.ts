// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SHARED_DATABASE_FILE_ENV } from "./constants.js";
import { runCommand } from "./run-command.js";
import { startSharedCluster } from "./start-shared-cluster.js";
import { stopSharedCluster } from "./stop-shared-cluster.js";
import { writeConnectionFile } from "./write-connection-file.js";

export const runWithSharedDatabase = async (
  command: string,
  args: readonly string[],
): Promise<number> => {
  const cluster = await startSharedCluster();
  const connectionFilePath = await writeConnectionFile(cluster.connection);
  try {
    return await runCommand(command, args, {
      ...process.env,
      [SHARED_DATABASE_FILE_ENV]: connectionFilePath,
    });
  } finally {
    await stopSharedCluster(cluster, connectionFilePath);
  }
};
