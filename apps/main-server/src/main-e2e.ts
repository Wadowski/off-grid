// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { startServer } from "./index.js";
import { modulesFor } from "./module-wiring/modules-for.js";
import { failStartup } from "./lifecycle/fail-startup.js";
import { closeOnSignals } from "./lifecycle/close-on-signals.js";
import { loadConfigOrExit } from "./config/load-config-or-exit.js";
import { createControlledClock } from "./e2e/controlled-clock.js";
import { registerE2eClockRoutes } from "./e2e/register-e2e-clock-routes.js";

const config = loadConfigOrExit();
const controlled = createControlledClock();
const running = await startServer(config, modulesFor(config), {
  clock: controlled.clock,
  extraRoutes: (api) => registerE2eClockRoutes(api, controlled),
}).catch(failStartup);

closeOnSignals(running);
