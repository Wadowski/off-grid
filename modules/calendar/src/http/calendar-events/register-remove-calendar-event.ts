// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventParamsSchema } from "@offgrid/contracts";
import { sendReadOutcome, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { removeCalendarEvent } from "../../application/calendar-events/remove-calendar-event.js";
import type { CalendarRouteContext } from "../../types.js";

export const registerRemoveCalendarEvent = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.delete(
    "/events/:id",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarEventParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await removeCalendarEvent(context.db, userId, params.data.id);
      if (outcome.outcome !== "found") {
        return sendReadOutcome(reply, outcome);
      }
      return reply.code(204).send();
    }),
  );
};
