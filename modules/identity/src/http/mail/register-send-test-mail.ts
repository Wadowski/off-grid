// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { adminRoutes, mailSettingsRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { sendTestMail } from "../../application/mail/send-test-mail.js";
import { sendMailWithSmtp } from "../../infrastructure/mail/send-mail-with-smtp.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendAdminError } from "../admin/send-admin-error.js";

export const registerSendTestMail = (api: FastifyInstance, context: IdentityRouteContext): void => {
  api.post(
    adminRoutes.mailTest,
    withUser(context.currentUserId, async (request, reply, actorUserId) => {
      const body = mailSettingsRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        await sendTestMail(context.db, sendMailWithSmtp, actorUserId, body.data);
        context.logger.info("instance admin sent a test email", {
          action: "mail.test-sent",
          actorUserId,
          provider: body.data.provider,
        });
        return reply.code(200).send({ sent: true });
      } catch (error) {
        return sendAdminError(reply, error);
      }
    }),
  );
};
