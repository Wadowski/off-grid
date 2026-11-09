// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberParamsSchema } from "@offgrid/contracts";
import { sendReadOutcome, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { removeFamilyMember } from "../application/remove-family-member.js";
import type { FamilyRouteContext } from "../types.js";
import { sendLastAdmin } from "./send-last-admin.js";

export const registerRemoveFamilyMember = (
  api: FastifyInstance,
  context: FamilyRouteContext,
): void => {
  api.delete(
    "/families/:id/members/:userId",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = familyMemberParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await removeFamilyMember(
        context.db,
        userId,
        params.data.id,
        params.data.userId,
      );
      if (outcome.outcome === "last-admin") {
        return sendLastAdmin(reply);
      }
      if (outcome.outcome !== "found") {
        return sendReadOutcome(reply, outcome);
      }
      return reply.code(204).send();
    }),
  );
};
