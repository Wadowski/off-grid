// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventParamsSchema, calendarEventSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { getCalendarEvent } from "../../application/calendar-events/get-calendar-event.js";
import type { CalendarRouteContext } from "../../types.js";
import { toCalendarEvent } from "./to-calendar-event.js";

export const registerGetCalendarEvent = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.get(
    "/events/:id",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarEventParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await getCalendarEvent(context.db, userId, params.data.id);
      if (outcome.outcome !== "found") {
        return sendNotFound(reply);
      }
      return reply.send(calendarEventSchema.parse(toCalendarEvent(outcome.value)));
    }),
  );
};
