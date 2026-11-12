// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarEventSchema,
  calendarParamsSchema,
  createCalendarEventRequestSchema,
} from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { createCalendarEvent } from "../../application/calendar-events/create-calendar-event.js";
import type { CalendarRouteContext } from "../../types.js";
import { toCalendarEvent } from "./to-calendar-event.js";

export const registerCreateCalendarEvent = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.post(
    "/calendars/:id/events",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const body = createCalendarEventRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const outcome = await createCalendarEvent(context.db, userId, params.data.id, body.data);
      if (outcome.outcome !== "found") {
        return sendNotFound(reply);
      }
      return reply.code(201).send(calendarEventSchema.parse(toCalendarEvent(outcome.value)));
    }),
  );
};
