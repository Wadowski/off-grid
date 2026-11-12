// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarSchema, createCalendarRequestSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { createCalendar } from "../application/calendars/create-calendar.js";
import type { CalendarRouteContext } from "../types.js";
import { toCalendar } from "./to-calendar.js";

export const registerCreateCalendar = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.post(
    "/calendars",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = createCalendarRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const outcome = await createCalendar(context.db, userId, {
        name: body.data.name,
        color: body.data.color,
        familyId: body.data.familyId,
      });
      if (outcome.outcome !== "found") {
        return sendNotFound(reply);
      }
      return reply.code(201).send(calendarSchema.parse(toCalendar(outcome.value)));
    }),
  );
};
