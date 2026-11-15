// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { ControlledClock } from "./controlled-clock.js";
import { registerDeleteE2eClock } from "./register-delete-e2e-clock.js";
import { registerPutE2eClock } from "./register-put-e2e-clock.js";

export const registerE2eClockRoutes = (api: FastifyInstance, control: ControlledClock): void => {
  registerPutE2eClock(api, control);
  registerDeleteE2eClock(api, control);
};
