// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createDiskFileStorage } from "@offgrid/file-storage";
import { createStorageIntegritySweepWorker } from "./workers/storage-integrity-sweep/create-storage-integrity-sweep-worker.js";
import { STORAGE_SWEEP_FIRST_RUN_DELAY_MS, STORAGE_SWEEP_INTERVAL_MS } from "./constants.js";
import type { FilesModuleOptions, FilesWorkerContext } from "./types.js";

export const createFilesModule = (options: FilesModuleOptions) => {
  const storage = createDiskFileStorage(options.directory);
  return {
    name: "files",
    workers: (context: FilesWorkerContext) => [
      createStorageIntegritySweepWorker({
        db: context.db,
        storage,
        logger: context.logger,
        now: () => new Date(),
        intervalMs: STORAGE_SWEEP_INTERVAL_MS,
        firstRunDelayMs: STORAGE_SWEEP_FIRST_RUN_DELAY_MS,
      }),
    ],
  };
};
