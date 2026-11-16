// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventParamsSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listEventGuests } from "../../application/event-guests/list-event-guests.js";
import type { CalendarRouteContext } from "../../types.js";

export const registerListEventGuests = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.get(
    "/events/:id/guests",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarEventParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const listing = await listEventGuests(context.db, userId, params.data.id);
      if (listing.outcome === "not-found") {
        return sendNotFound(reply);
      }
      return reply.code(200).send({ guests: listing.guests });
    }),
  );
};
