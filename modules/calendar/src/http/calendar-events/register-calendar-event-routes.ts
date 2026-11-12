// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { CalendarRouteContext } from "../../types.js";
import { registerCreateCalendarEvent } from "./register-create-calendar-event.js";
import { registerGetCalendarEvent } from "./register-get-calendar-event.js";
import { registerListCalendarEvents } from "./register-list-calendar-events.js";
import { registerRemoveCalendarEvent } from "./register-remove-calendar-event.js";
import { registerUpdateCalendarEvent } from "./register-update-calendar-event.js";

export const registerCalendarEventRoutes = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  registerListCalendarEvents(api, context);
  registerCreateCalendarEvent(api, context);
  registerGetCalendarEvent(api, context);
  registerUpdateCalendarEvent(api, context);
  registerRemoveCalendarEvent(api, context);
};
