// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { startServer } from "./index.js";
import { MODULES } from "./constants.js";
import { failStartup } from "./fail-startup.js";
import { loadConfigOrExit } from "./load-config-or-exit.js";

const running = await startServer(loadConfigOrExit(), MODULES).catch(failStartup);

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    void running.close().then(() => process.exit(0), failStartup);
  });
}
