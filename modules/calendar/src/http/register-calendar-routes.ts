// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { CalendarRouteContext } from "../types.js";
import { registerCalendarEventRoutes } from "./calendar-events/register-calendar-event-routes.js";
import { registerCreateCalendar } from "./register-create-calendar.js";
import { registerListCalendars } from "./register-list-calendars.js";
import { registerRemoveCalendar } from "./register-remove-calendar.js";
import { registerUpdateCalendar } from "./register-update-calendar.js";
import { registerTimeZoneRoutes } from "./time-zone/register-time-zone-routes.js";

export const registerCalendarRoutes = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  registerListCalendars(api, context);
  registerCreateCalendar(api, context);
  registerUpdateCalendar(api, context);
  registerRemoveCalendar(api, context);
  registerCalendarEventRoutes(api, context);
  registerTimeZoneRoutes(api, context);
};
