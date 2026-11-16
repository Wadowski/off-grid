// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { crossEntityLinkParamsSchema, relationsRoutes } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { removeCrossEntityLink } from "../../application/cross-entity-links/remove-cross-entity-link.js";
import type { RelationsRouteContext } from "../../types.js";
import { actorOf } from "./actor-of.js";

export const registerRemoveCrossEntityLink = (
  api: FastifyInstance,
  context: RelationsRouteContext,
): void => {
  api.delete(
    relationsRoutes.crossEntityLink,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = crossEntityLinkParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      const outcome = await removeCrossEntityLink(
        context.db,
        actorOf(context, request, userId),
        params.data.id,
      );
      if (outcome.outcome !== "found") {
        return sendNotFound(reply);
      }
      return reply.code(204).send();
    }),
  );
};
