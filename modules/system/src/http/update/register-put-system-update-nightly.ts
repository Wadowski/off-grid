// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { systemRoutes, systemUpdateNightlySchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { setNightlyUpdate } from "../../application/update/set-nightly-update.js";
import type { SystemUpdateRouteContext } from "../../types.js";
import { sendUpdateError } from "./send-update-error.js";

export const registerPutSystemUpdateNightly = (
  api: FastifyInstance,
  context: SystemUpdateRouteContext,
): void => {
  api.put(
    systemRoutes.updateNightly,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = systemUpdateNightlySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        return reply
          .code(200)
          .send(await setNightlyUpdate(context.deps, userId, body.data.enabled));
      } catch (error) {
        return sendUpdateError(reply, error);
      }
    }),
  );
};
