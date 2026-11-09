// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { redeemFamilyInvitationRequestSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { redeemFamilyInvitation } from "../../application/invitations/redeem-family-invitation.js";
import type { FamilyRouteContext } from "../../types.js";
import { sendInvitationRateLimited } from "./send-invitation-rate-limited.js";

export const registerRedeemFamilyInvitation = (
  api: FastifyInstance,
  context: FamilyRouteContext,
): void => {
  api.post(
    "/families/join",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = redeemFamilyInvitationRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const outcome = await redeemFamilyInvitation(context.db, userId, body.data.code);
      if (outcome.outcome === "rate-limited") {
        return sendInvitationRateLimited(reply);
      }
      if (outcome.outcome === "invalid") {
        return sendNotFound(reply);
      }
      return reply.code(201).send(outcome.value);
    }),
  );
};
