// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { adminRoutes, mailSettingsRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { saveMailSettings } from "../../application/mail/save-mail-settings.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendAdminError } from "../admin/send-admin-error.js";

export const registerSaveMailSettings = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.put(
    adminRoutes.mailSettings,
    withUser(context.currentUserId, async (request, reply, actorUserId) => {
      const body = mailSettingsRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const settings = await saveMailSettings(
          context.db,
          context.mailEncryptionKey,
          actorUserId,
          body.data,
        );
        context.logger.info("instance admin saved mail settings", {
          action: "mail.settings-saved",
          actorUserId,
          provider: body.data.provider,
        });
        return reply.code(200).send(settings);
      } catch (error) {
        return sendAdminError(reply, error);
      }
    }),
  );
};
