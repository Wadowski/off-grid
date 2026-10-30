// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { FamilyRouteContext } from "../types.js";
import { sendReadOutcome, sendValidationFailed, withUser } from "@offgrid/http";
import { familyParamsSchema } from "@offgrid/contracts";
import { getFamily } from "../application/get-family.js";

export const registerGetFamily = (api: FastifyInstance, context: FamilyRouteContext): void => {
  api.get(
    "/families/:id",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = familyParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await getFamily(context.pool, userId, params.data.id);
      return sendReadOutcome(reply, outcome);
    }),
  );
};
