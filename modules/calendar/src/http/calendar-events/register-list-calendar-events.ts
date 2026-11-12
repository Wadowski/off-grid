// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventListSchema, calendarParamsSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listCalendarEvents } from "../../application/calendar-events/list-calendar-events.js";
import type { CalendarRouteContext } from "../../types.js";
import { toCalendarEvent } from "./to-calendar-event.js";

export const registerListCalendarEvents = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.get(
    "/calendars/:id/events",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await listCalendarEvents(context.db, userId, params.data.id);
      if (outcome.outcome !== "found") {
        return sendNotFound(reply);
      }
      return reply.send(
        calendarEventListSchema.parse({ events: outcome.value.map(toCalendarEvent) }),
      );
    }),
  );
};
