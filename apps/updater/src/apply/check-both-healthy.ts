// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HealthProbe, HealthProbes } from "../types.js";

export const checkBothHealthy =
  (probes: HealthProbes): HealthProbe =>
  async () => {
    const [serverHealthy, webHealthy] = await Promise.all([probes.server(), probes.web()]);
    return serverHealthy && webHealthy;
  };
