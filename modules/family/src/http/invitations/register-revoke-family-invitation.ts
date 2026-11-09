// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyInvitationParamsSchema } from "@offgrid/contracts";
import { sendReadOutcome, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { revokeFamilyInvitation } from "../../application/invitations/revoke-family-invitation.js";
import type { FamilyRouteContext } from "../../types.js";

export const registerRevokeFamilyInvitation = (
  api: FastifyInstance,
  context: FamilyRouteContext,
): void => {
  api.delete(
    "/families/:id/invitations/:invitationId",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = familyInvitationParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await revokeFamilyInvitation(
        context.db,
        userId,
        params.data.id,
        params.data.invitationId,
      );
      if (outcome.outcome !== "found") {
        return sendReadOutcome(reply, outcome);
      }
      return reply.code(204).send();
    }),
  );
};
