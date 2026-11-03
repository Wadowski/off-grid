// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes, updateProfileRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { updateOwnDisplayName } from "../../application/account/update-own-display-name.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendAccountError } from "./send-account-error.js";

export const registerUpdateProfile = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.patch(
    accountRoutes.me,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = updateProfileRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        await updateOwnDisplayName(context.db, userId, body.data.displayName);
        return reply.code(204).send();
      } catch (error) {
        return sendAccountError(reply, error);
      }
    }),
  );
};
