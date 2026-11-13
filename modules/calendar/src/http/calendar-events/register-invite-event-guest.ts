// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventParamsSchema, inviteEventGuestRequestSchema } from "@offgrid/contracts";
import { sendError, sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import {
  inviteEventGuest,
  type InviteEventGuestOutcome,
} from "../../application/event-guests/invite-event-guest.js";
import { EventGuestInviteRefusedError } from "../../application/errors/event-guest-invite-refused-error.js";
import { EventGuestWriteDeniedError } from "../../application/errors/event-guest-write-denied-error.js";
import type { CalendarRouteContext } from "../../types.js";
import { GUEST_WRITE_DENIED_MESSAGE } from "./guest-write-denied-message.js";

const REFUSED_MESSAGE = "This person cannot be invited to the event";

export const registerInviteEventGuest = (
  api: FastifyInstance,
  context: CalendarRouteContext,
): void => {
  api.post(
    "/events/:id/guests",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = calendarEventParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const body = inviteEventGuestRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      let outcome: InviteEventGuestOutcome;
      try {
        outcome = await inviteEventGuest(context.db, userId, params.data.id, body.data.guestUserId);
      } catch (error) {
        if (error instanceof EventGuestWriteDeniedError) {
          return sendError(reply, 403, "FORBIDDEN", GUEST_WRITE_DENIED_MESSAGE);
        }
        if (error instanceof EventGuestInviteRefusedError) {
          return sendError(reply, 400, "VALIDATION_FAILED", REFUSED_MESSAGE);
        }
        throw error;
      }
      if (outcome.outcome === "not-found") {
        return sendNotFound(reply);
      }
      const invitation = { eventId: params.data.id, guestUserId: body.data.guestUserId };
      return outcome.outcome === "invited"
        ? reply.code(201).send(invitation)
        : reply.code(200).send(invitation);
    }),
  );
};
