// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarEventParamsSchema,
  calendarEventSchema,
  updateCalendarEventRequestSchema,
} from "@offgrid/contracts";
import { sendError, sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { updateCalendarEvent } from "../../application/calendar-events/update-calendar-event.js";
import { EventMoveOwnerMismatchError } from "../../application/errors/event-move-owner-mismatch-error.js";
import type { CalendarRouteContext } from "../../types.js";
import { toCalendarEvent } from "./to-calendar-event.js";

const WINDOW_MESSAGE = "The event must not end before it starts";

export const registerUpdateCalendarEvent = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.patch(
    "/events/:id",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarEventParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const body = updateCalendarEventRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      let outcome;
      try {
        outcome = await updateCalendarEvent(context.db, userId, params.data.id, body.data);
      } catch (error) {
        if (error instanceof EventMoveOwnerMismatchError) {
          return sendError(
            reply,
            409,
            "EVENT_MOVE_OWNER_MISMATCH",
            "An event can only move to a calendar with the same owner",
          );
        }
        throw error;
      }
      if (outcome.outcome === "invalid-window") {
        return sendError(reply, 400, "VALIDATION_FAILED", WINDOW_MESSAGE);
      }
      if (outcome.outcome !== "found") {
        return sendNotFound(reply);
      }
      return reply.send(calendarEventSchema.parse(toCalendarEvent(outcome.value)));
    }),
  );
};
