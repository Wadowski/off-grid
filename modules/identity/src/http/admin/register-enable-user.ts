// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { adminRoutes } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import type { IdentityRouteContext } from "../../types.js";
import { handleSetUserDisabled } from "./handle-set-user-disabled.js";

export const registerEnableUser = (api: FastifyInstance, context: IdentityRouteContext): void => {
  api.post(
    adminRoutes.enableUser,
    withUser(context.currentUserId, (request, reply, actorUserId) =>
      handleSetUserDisabled(request, reply, actorUserId, context, false),
    ),
  );
};
