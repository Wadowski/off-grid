// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarTimeZoneSchema, updateCalendarTimeZoneRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { setTimeZone } from "../../application/time-zone/time-zone-settings.js";
import type { CalendarRouteContext } from "../../types.js";

export const registerSetTimeZone = (api: FastifyInstance, context: CalendarRouteContext): void => {
  api.put(
    "/calendar/time-zone",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = updateCalendarTimeZoneRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const setting = await setTimeZone(context.db, userId, body.data.timeZone);
      return reply.send(calendarTimeZoneSchema.parse(setting));
    }),
  );
};
