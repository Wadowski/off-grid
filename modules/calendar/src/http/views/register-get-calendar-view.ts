// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarViewParamsSchema, calendarViewSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listCalendarView } from "../../application/views/list-calendar-view.js";
import type { CalendarRouteContext } from "../../types.js";
import { toCalendarView } from "./to-calendar-view.js";

export const registerGetCalendarView = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.get(
    "/calendar/views/:view",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarViewParamsSchema.safeParse({
        view: (request.params as { view?: unknown }).view,
        date: (request.query as { date?: unknown }).date,
      });
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const result = await listCalendarView(context.db, userId, params.data);
      return reply.send(calendarViewSchema.parse(toCalendarView(result)));
    }),
  );
};
