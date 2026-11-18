// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import type { ReleaseRun, UpdateStatus } from "../types.js";

export const runInBackground = (
  logger: Logger,
  release: ReleaseRun,
  job: () => Promise<UpdateStatus>,
): void => {
  void job()
    .then((status) => {
      logger.info("update run finished", { outcome: status.outcome });
    })
    .catch(() => {
      logger.error("update run ended with an error");
    })
    .finally(release);
};
