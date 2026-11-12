// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { CalendarRouteContext } from "../../types.js";
import { registerGetCalendarView } from "./register-get-calendar-view.js";

export const registerCalendarViewRoutes = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  registerGetCalendarView(api, context);
};
