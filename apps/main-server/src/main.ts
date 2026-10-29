// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { loadConfig } from "./config.js";
import { MODULES } from "./module-list.js";
import { startServer } from "./server.js";

const failStartup = (error: unknown): never => {
  process.stderr.write(`${error instanceof Error ? error.message : "startup failed"}\n`);
  process.exit(1);
};

const config = (() => {
  try {
    return loadConfig();
  } catch (error) {
    return failStartup(error);
  }
})();

const running = await startServer(config, MODULES).catch(failStartup);

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    void running.close().then(() => process.exit(0));
  });
}
