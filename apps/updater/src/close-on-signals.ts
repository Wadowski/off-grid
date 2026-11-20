// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { failStartup } from "./fail-startup.js";

export const closeOnSignals = (app: FastifyInstance, stopNightlyScheduler: () => void): void => {
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => {
      stopNightlyScheduler();
      void app.close().then(() => process.exit(0), failStartup);
    });
  }
};
