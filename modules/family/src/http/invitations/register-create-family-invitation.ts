// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyParamsSchema } from "@offgrid/contracts";
import { sendReadOutcome, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { createFamilyInvitation } from "../../application/invitations/create-family-invitation.js";
import type { FamilyRouteContext } from "../../types.js";

export const registerCreateFamilyInvitation = (
  api: FastifyInstance,
  context: FamilyRouteContext,
): void => {
  api.post(
    "/families/:id/invitations",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = familyParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await createFamilyInvitation(context.db, userId, params.data.id);
      if (outcome.outcome !== "found") {
        return sendReadOutcome(reply, outcome);
      }
      return reply.code(201).send(outcome.value);
    }),
  );
};
