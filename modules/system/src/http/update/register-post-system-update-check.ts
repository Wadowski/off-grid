// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { systemRoutes } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { checkForUpdate } from "../../application/update/check-for-update.js";
import type { SystemUpdateRouteContext } from "../../types.js";
import { sendUpdateError } from "./send-update-error.js";

export const registerPostSystemUpdateCheck = (
  api: FastifyInstance,
  context: SystemUpdateRouteContext,
): void => {
  api.post(
    systemRoutes.updateCheck,
    withUser(context.currentUserId, async (_request, reply, userId) => {
      try {
        return reply.code(200).send(await checkForUpdate(context.deps, userId));
      } catch (error) {
        return sendUpdateError(reply, error);
      }
    }),
  );
};
