// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyParamsSchema } from "@offgrid/contracts";
import { sendReadOutcome, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listFamilyMembers } from "../application/list-family-members.js";
import type { FamilyRouteContext } from "../types.js";

export const registerListFamilyMembers = (
  api: FastifyInstance,
  context: FamilyRouteContext,
): void => {
  api.get(
    "/families/:id/members",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = familyParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await listFamilyMembers(context.db, userId, params.data.id);
      return sendReadOutcome(reply, outcome);
    }),
  );
};
