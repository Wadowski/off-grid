// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarListSchema } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listCalendarsFor } from "../application/calendars/list-calendars.js";
import type { CalendarRouteContext } from "../types.js";
import { toCalendar } from "./to-calendar.js";

export const registerListCalendars = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.get(
    "/calendars",
    withUser(context.currentUserId, async (_request, reply, userId) => {
      const records = await listCalendarsFor(context.db, userId);
      return reply.send(calendarListSchema.parse({ calendars: records.map(toCalendar) }));
    }),
  );
};
