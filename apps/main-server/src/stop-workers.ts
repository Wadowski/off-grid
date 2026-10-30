// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Worker } from "./types.js";

export const stopWorkers = async (workers: readonly Worker[]): Promise<void> => {
  for (const worker of [...workers].reverse()) {
    await worker.stop();
  }
};
