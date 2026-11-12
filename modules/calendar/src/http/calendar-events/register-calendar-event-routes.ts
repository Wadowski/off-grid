// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarEventListSchema,
  calendarEventParamsSchema,
  calendarEventSchema,
  calendarParamsSchema,
  createCalendarEventRequestSchema,
  updateCalendarEventRequestSchema,
} from "@offgrid/contracts";
import {
  sendError,
  sendNotFound,
  sendReadOutcome,
  sendValidationFailed,
  withUser,
} from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { createCalendarEvent } from "../../application/calendar-events/create-calendar-event.js";
import { getCalendarEvent } from "../../application/calendar-events/get-calendar-event.js";
import { listCalendarEvents } from "../../application/calendar-events/list-calendar-events.js";
import { removeCalendarEvent } from "../../application/calendar-events/remove-calendar-event.js";
import { updateCalendarEvent } from "../../application/calendar-events/update-calendar-event.js";
import { EventMoveOwnerMismatchError } from "../../application/errors/event-move-owner-mismatch-error.js";
import type { CalendarRouteContext } from "../../types.js";
import { toCalendarEvent } from "./to-calendar-event.js";

// Messages here are fixed text. They never echo request values such as the title.
const WINDOW_MESSAGE = "endsAt must not be before startsAt";

export const registerCalendarEventRoutes = (
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
