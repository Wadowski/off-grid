// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesWorker, TrashPurgeWorkerOptions } from "../../types.js";
import { runTrashPurge } from "./run-trash-purge.js";

export const createTrashPurgeWorker = (options: TrashPurgeWorkerOptions): FilesWorker => {
  let firstRunTimer: ReturnType<typeof setTimeout> | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let running: Promise<void> | undefined;

  const purgeUnlessRunning = (): void => {
    if (running !== undefined) {
      return;
    }
    running = runTrashPurge(
      options.db,
      options.storage,
      options.now(),
      options.retentionDays,
      options.logger,
    ).finally(() => {
      running = undefined;
    });
  };

  return {
    name: "files-trash-purge",
    start: async () => {
      if (timer !== undefined) {
        return;
      }
      firstRunTimer = setTimeout(purgeUnlessRunning, options.firstRunDelayMs);
      timer = setInterval(purgeUnlessRunning, options.intervalMs);
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
