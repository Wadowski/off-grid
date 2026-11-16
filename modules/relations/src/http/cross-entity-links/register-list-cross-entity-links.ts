// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  crossEntityLinkListQuerySchema,
  crossEntityLinkListSchema,
  relationsRoutes,
} from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listCrossEntityLinks } from "../../application/cross-entity-links/list-cross-entity-links.js";
import type { RelationsRouteContext } from "../../types.js";
import { actorOf } from "./actor-of.js";
import { toCrossEntityLinkWithTitle } from "./to-cross-entity-link-with-title.js";

export const registerListCrossEntityLinks = (
  api: FastifyInstance,
  context: RelationsRouteContext,
): void => {
  api.get(
    relationsRoutes.crossEntityLinks,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const query = crossEntityLinkListQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationFailed(reply, query.error);
      }
      const outcome = await listCrossEntityLinks(context.db, actorOf(context, request, userId), {
        entityType: query.data.entityType,
        entityId: query.data.entityId,
      });
      if (outcome.outcome !== "found") {
        return sendNotFound(reply);
      }
      return reply.send(
        crossEntityLinkListSchema.parse({
          links: outcome.value.map(toCrossEntityLinkWithTitle),
        }),
      );
    }),
  );
};
