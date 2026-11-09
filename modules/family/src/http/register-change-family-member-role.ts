// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { changeFamilyMemberRoleRequestSchema, familyMemberParamsSchema } from "@offgrid/contracts";
import { sendReadOutcome, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { changeFamilyMemberRole } from "../application/change-family-member-role.js";
import type { FamilyRouteContext } from "../types.js";
import { sendLastAdmin } from "./send-last-admin.js";

export const registerChangeFamilyMemberRole = (
  api: FastifyInstance,
  context: FamilyRouteContext,
): void => {
  api.patch(
    "/families/:id/members/:userId",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = familyMemberParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const body = changeFamilyMemberRoleRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const outcome = await changeFamilyMemberRole(
        context.db,
        userId,
        params.data.id,
        params.data.userId,
        body.data.role,
      );
      if (outcome.outcome === "last-admin") {
        return sendLastAdmin(reply);
      }
      return sendReadOutcome(reply, outcome);
    }),
  );
};
