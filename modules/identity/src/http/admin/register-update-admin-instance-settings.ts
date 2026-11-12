// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { adminRoutes, instanceSettingsUpdateSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { updateInstanceSettings } from "../../application/admin/update-instance-settings.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendAdminError } from "./send-admin-error.js";

export const registerUpdateAdminInstanceSettings = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.patch(
    adminRoutes.instanceSettings,
    withUser(context.currentUserId, async (request, reply, actorUserId) => {
      const body = instanceSettingsUpdateSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const settings = await updateInstanceSettings(
          context.db,
          actorUserId,
          body.data.registrationOpen,
        );
        context.logger.info("instance admin changed registration", {
          action: "registration.changed",
          actorUserId,
          registrationOpen: settings.registrationOpen,
        });
        return reply.code(200).send(settings);
      } catch (error) {
        return sendAdminError(reply, error);
      }
    }),
  );
};
