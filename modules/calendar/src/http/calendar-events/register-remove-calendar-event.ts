// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventParamsSchema } from "@offgrid/contracts";
import { sendError, sendReadOutcome, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { removeCalendarEvent } from "../../application/calendar-events/remove-calendar-event.js";
import { EventGuestWriteDeniedError } from "../../application/errors/event-guest-write-denied-error.js";
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
      let outcome;
      try {
        outcome = await removeCalendarEvent(context.db, userId, params.data.id);
      } catch (error) {
        if (error instanceof EventGuestWriteDeniedError) {
          return sendError(reply, 403, "FORBIDDEN", "A guest of the event may not change it");
        }
        throw error;
      }
      if (outcome.outcome !== "found") {
        return sendReadOutcome(reply, outcome);
      }
      return reply.code(204).send();
    }),
  );
};
