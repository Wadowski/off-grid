// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { adminRoutes } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { getMailSettings } from "../../application/mail/get-mail-settings.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendAdminError } from "../admin/send-admin-error.js";

export const registerGetMailSettings = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.get(
    adminRoutes.mailSettings,
    withUser(context.currentUserId, async (_request, reply, actorUserId) => {
      try {
        return reply.code(200).send(await getMailSettings(context.db, actorUserId));
      } catch (error) {
        return sendAdminError(reply, error);
      }
    }),
  );
};
