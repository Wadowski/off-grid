// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createLogger } from "@offgrid/observability";
import { createUpdaterServices } from "./create-updater-services.js";
import { failStartup } from "./fail-startup.js";
import { loadUpdaterConfig } from "./config/load-updater-config.js";
import { systemClock } from "./backup/system-clock.js";
import { buildUpdaterApp } from "./http/build-updater-app.js";
import { closeOnSignals } from "./close-on-signals.js";
import { readNightlySetting } from "./schedule/read-nightly-setting.js";
import { runNightlyUpdate } from "./schedule/run-nightly-update.js";
import { startNightlyScheduler } from "./schedule/start-nightly-scheduler.js";

const config = (() => {
  try {
    return loadUpdaterConfig();
  } catch (error) {
    return failStartup(error);
  }
})();
const logger = createLogger({ bindings: { module: "updater" } });
const services = createUpdaterServices(config, logger);
const app = buildUpdaterApp(services);
await app.listen({ host: config.httpHost, port: config.httpPort }).catch(failStartup);
const stopNightlyScheduler = startNightlyScheduler({
  clock: systemClock,
  nightlyTime: config.nightlyTime,
  logger,
  runTick: () =>
    runNightlyUpdate(services, () =>
      readNightlySetting(config.serverUrl, config.apiToken, services.httpFetch),
    ),
});
closeOnSignals(app, stopNightlyScheduler);
