// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarParamsSchema } from "@offgrid/contracts";
import { sendError, sendReadOutcome, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { removeCalendar } from "../application/calendars/remove-calendar.js";
import type { CalendarRouteContext } from "../types.js";

export const registerRemoveCalendar = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
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
};
