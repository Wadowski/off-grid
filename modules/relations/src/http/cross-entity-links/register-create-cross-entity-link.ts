// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  createCrossEntityLinkRequestSchema,
  crossEntityLinkSchema,
  relationsRoutes,
} from "@offgrid/contracts";
import { sendError, sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { createCrossEntityLink } from "../../application/cross-entity-links/create-cross-entity-link.js";
import type { RelationsRouteContext } from "../../types.js";
import { actorOf } from "./actor-of.js";
import { toCrossEntityLink } from "./to-cross-entity-link.js";

export const registerCreateCrossEntityLink = (
  api: FastifyInstance,
  context: RelationsRouteContext,
): void => {
  api.post(
    relationsRoutes.crossEntityLinks,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = createCrossEntityLinkRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const outcome = await createCrossEntityLink(
        context.db,
        actorOf(context, request, userId),
        { entityType: body.data.sourceType, entityId: body.data.sourceId },
        { entityType: body.data.targetType, entityId: body.data.targetId },
      );
      switch (outcome.outcome) {
        case "created":
          return reply
            .code(201)
            .send(crossEntityLinkSchema.parse(toCrossEntityLink(outcome.value)));
        case "existing":
          return reply
            .code(200)
            .send(crossEntityLinkSchema.parse(toCrossEntityLink(outcome.value)));
        case "self-link":
          return sendError(reply, 422, "SELF_LINK", "An entity cannot be linked to itself.");
        case "conflict":
          return sendError(reply, 409, "LINK_CONFLICT", "The two entities are already linked.");
        case "not-found":
          return sendNotFound(reply);
      }
    }),
  );
};
