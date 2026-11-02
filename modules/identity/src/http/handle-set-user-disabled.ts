// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sendValidationFailed } from "@offgrid/http";
import type { FastifyReply, FastifyRequest } from "fastify";
import { setUserDisabled } from "../application/set-user-disabled.js";
import type { IdentityRouteContext } from "../types.js";
import { sendAdminError } from "./send-admin-error.js";
import { userParamsSchema } from "./user-params-schema.js";

export const handleSetUserDisabled = async (
  request: FastifyRequest,
  reply: FastifyReply,
  actorUserId: string,
  context: IdentityRouteContext,
  disabled: boolean,
): Promise<FastifyReply> => {
  const params = userParamsSchema.safeParse(request.params);
  if (!params.success) {
    return sendValidationFailed(reply, params.error);
  }
  try {
    const user = await setUserDisabled(context.db, actorUserId, params.data.userId, disabled);
    context.logger.info("instance admin changed account status", {
      action: disabled ? "user.disabled" : "user.enabled",
      actorUserId,
      targetUserId: user.id,
    });
    return reply.code(200).send(user);
  } catch (error) {
    return sendAdminError(reply, error);
  }
};
