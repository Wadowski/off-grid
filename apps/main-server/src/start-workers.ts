// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Worker } from "./types.js";

export const startWorkers = async (workers: readonly Worker[]): Promise<void> => {
  for (const worker of workers) {
    await worker.start();
  }
};
