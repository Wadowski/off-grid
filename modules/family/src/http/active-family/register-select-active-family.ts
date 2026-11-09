// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { selectActiveFamilyRequestSchema } from "@offgrid/contracts";
import {
  sendReadOutcome,
  sendUnauthenticated,
  sendValidationFailed,
  withUser,
} from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { selectActiveFamily } from "../../application/active-family/select-active-family.js";
import type { FamilyRouteContext } from "../../types.js";

export const registerSelectActiveFamily = (
  api: FastifyInstance,
  context: FamilyRouteContext,
): void => {
  api.put(
    "/families/active",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = selectActiveFamilyRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const sessionId = context.currentSessionId(request);
      if (sessionId === null) {
        return sendUnauthenticated(reply);
      }
      const outcome = await selectActiveFamily(context.db, userId, sessionId, body.data.familyId);
      return sendReadOutcome(reply, outcome);
    }),
  );
};
