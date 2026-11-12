// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { adminRoutes } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { getAdminInstanceSettings } from "../../application/admin/get-admin-instance-settings.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendAdminError } from "./send-admin-error.js";

export const registerGetAdminInstanceSettings = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.get(
    adminRoutes.instanceSettings,
    withUser(context.currentUserId, async (_request, reply, actorUserId) => {
      try {
        return reply.code(200).send(await getAdminInstanceSettings(context.db, actorUserId));
      } catch (error) {
        return sendAdminError(reply, error);
      }
    }),
  );
};
