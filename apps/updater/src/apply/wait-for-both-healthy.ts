// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { waitForHealth } from "../backup/wait-for-health.js";
import type { ApplyDependencies } from "../types.js";
import { checkBothHealthy } from "./check-both-healthy.js";

export const waitForBothHealthy = async (
  dependencies: Pick<ApplyDependencies, "health" | "clock" | "healthTimeoutMilliseconds">,
): Promise<void> => {
  const healthy = await waitForHealth(
    checkBothHealthy(dependencies.health),
    dependencies.clock,
    dependencies.healthTimeoutMilliseconds,
  );
  if (!healthy) {
    throw new Error("server or web did not become healthy in time");
  }
};
