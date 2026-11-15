// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RunningServer } from "../types.js";
import { failStartup } from "./fail-startup.js";

export const closeOnSignals = (running: RunningServer): void => {
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => {
      void running.close().then(() => process.exit(0), failStartup);
    });
  }
};
