// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { eventGuestParamsSchema } from "@offgrid/contracts";
import { sendError, sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { removeEventGuest } from "../../application/event-guests/remove-event-guest.js";
import { EventGuestWriteDeniedError } from "../../application/errors/event-guest-write-denied-error.js";
import type { CalendarRouteContext } from "../../types.js";
import { GUEST_WRITE_DENIED_MESSAGE } from "./guest-write-denied-message.js";

export const registerRemoveEventGuest = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.delete(
    "/events/:id/guests/:guestUserId",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = eventGuestParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      let outcome;
      try {
        outcome = await removeEventGuest(
          context.db,
          userId,
          params.data.id,
          params.data.guestUserId,
        );
      } catch (error) {
        if (error instanceof EventGuestWriteDeniedError) {
          return sendError(reply, 403, "FORBIDDEN", GUEST_WRITE_DENIED_MESSAGE);
        }
        throw error;
      }
      if (outcome.outcome === "not-found") {
        return sendNotFound(reply);
      }
      return reply.code(204).send();
    }),
  );
};
