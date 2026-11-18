// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesWorker, StorageIntegritySweepOptions } from "../../types.js";
import { runStorageIntegritySweep } from "./run-storage-integrity-sweep.js";

export const createStorageIntegritySweepWorker = (
  options: StorageIntegritySweepOptions,
): FilesWorker => {
  let firstRunTimer: ReturnType<typeof setTimeout> | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let running: Promise<void> | undefined;

  const sweepUnlessRunning = (): void => {
    if (running !== undefined) {
      return;
    }
    running = runStorageIntegritySweep(options.db, options.storage, options.now(), options.logger).finally(
      () => {
        running = undefined;
      },
    );
  };

  return {
    name: "files-storage-integrity-sweep",
    start: async () => {
      if (timer !== undefined) {
        return;
      }
      firstRunTimer = setTimeout(sweepUnlessRunning, options.firstRunDelayMs);
      timer = setInterval(sweepUnlessRunning, options.intervalMs);
    },
    stop: async () => {
      clearTimeout(firstRunTimer);
      clearInterval(timer);
      firstRunTimer = undefined;
      timer = undefined;
      await running;
    },
  };
};
