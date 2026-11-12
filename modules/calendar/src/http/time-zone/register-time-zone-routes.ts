// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { CalendarRouteContext } from "../../types.js";
import { registerGetTimeZone } from "./register-get-time-zone.js";
import { registerSetTimeZone } from "./register-set-time-zone.js";

export const registerTimeZoneRoutes = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  registerGetTimeZone(api, context);
  registerSetTimeZone(api, context);
};
