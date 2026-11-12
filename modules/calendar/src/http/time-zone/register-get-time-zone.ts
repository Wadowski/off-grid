// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarTimeZoneSchema } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { getTimeZone } from "../../application/time-zone/time-zone-settings.js";
import type { CalendarRouteContext } from "../../types.js";

export const registerGetTimeZone = (api: FastifyInstance, context: CalendarRouteContext): void => {
  api.get(
    "/calendar/time-zone",
    withUser(context.currentUserId, async (_request, reply, userId) => {
      const setting = await getTimeZone(context.db, userId);
      return reply.send(calendarTimeZoneSchema.parse(setting));
    }),
  );
};
