// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { waitForHealth } from "../backup/wait-for-health.js";
import type { ApplyDependencies, UpdateStepName } from "../types.js";
import { checkBothHealthy } from "./check-both-healthy.js";
import { ServiceNotHealthyError } from "./errors/service-not-healthy-error.js";

export const waitForBothHealthy = async (
  dependencies: Pick<ApplyDependencies, "health" | "clock" | "healthTimeoutMilliseconds">,
  step: UpdateStepName,
): Promise<void> => {
  const healthy = await waitForHealth(
    checkBothHealthy(dependencies.health),
    dependencies.clock,
    dependencies.healthTimeoutMilliseconds,
  );
  if (!healthy) {
    throw new ServiceNotHealthyError(step);
  }
};
