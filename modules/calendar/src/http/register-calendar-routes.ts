// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarListSchema,
  calendarParamsSchema,
  calendarSchema,
  createCalendarRequestSchema,
  updateCalendarRequestSchema,
} from "@offgrid/contracts";
import {
  sendError,
  sendNotFound,
  sendReadOutcome,
  sendValidationFailed,
  withUser,
} from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { createCalendar } from "../application/calendars/create-calendar.js";
import { listCalendarsFor } from "../application/calendars/list-calendars.js";
import { removeCalendar } from "../application/calendars/remove-calendar.js";
import { updateCalendar } from "../application/calendars/update-calendar.js";
import type { CalendarRecord, CalendarRouteContext } from "../types.js";
import { registerCalendarEventRoutes } from "./calendar-events/register-calendar-event-routes.js";
import { registerTimeZoneRoutes } from "./time-zone/register-time-zone-routes.js";

const toCalendar = (record: CalendarRecord) => ({
  id: record.calendarId,
  name: record.name,
  color: record.color,
  familyId: record.familyId,
  isDefault: record.isDefault,
});

export const registerCalendarRoutes = (
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

  api.delete(
    "/calendars/:id",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await removeCalendar(context.db, userId, params.data.id);
      if (outcome.outcome === "default-calendar") {
        return sendError(reply, 409, "DEFAULT_CALENDAR", "The default calendar cannot be deleted");
      }
      if (outcome.outcome !== "found") {
        return sendReadOutcome(reply, outcome);
      }
      return reply.code(204).send();
    }),
  );

  registerCalendarEventRoutes(api, context);
  registerTimeZoneRoutes(api, context);
};
