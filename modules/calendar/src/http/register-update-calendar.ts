// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarParamsSchema,
  calendarSchema,
  updateCalendarRequestSchema,
} from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { updateCalendar } from "../application/calendars/update-calendar.js";
import type { CalendarRouteContext } from "../types.js";
import { toCalendar } from "./to-calendar.js";

export const registerUpdateCalendar = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.patch(
    "/calendars/:id",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const body = updateCalendarRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const outcome = await updateCalendar(context.db, userId, params.data.id, body.data);
      if (outcome.outcome !== "found") {
        return sendNotFound(reply);
      }
      return reply.send(calendarSchema.parse(toCalendar(outcome.value)));
    }),
  );
};
