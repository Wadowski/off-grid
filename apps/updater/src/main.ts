// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createLogger } from "@offgrid/observability";
import { createUpdaterServices } from "./create-updater-services.js";
import { failStartup } from "./fail-startup.js";
import { loadUpdaterConfig } from "./config/load-updater-config.js";
import { buildUpdaterApp } from "./http/build-updater-app.js";
import { closeOnSignals } from "./close-on-signals.js";

const config = (() => {
  try {
    return loadUpdaterConfig();
  } catch (error) {
    return failStartup(error);
  }
})();
const logger = createLogger({ bindings: { module: "updater" } });
const app = buildUpdaterApp(createUpdaterServices(config, logger));
await app.listen({ host: config.httpHost, port: config.httpPort }).catch(failStartup);
closeOnSignals(app);
