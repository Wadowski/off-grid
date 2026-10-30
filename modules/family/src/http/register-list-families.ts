// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listMyFamilies } from "../application/list-my-families.js";
import type { FamilyRouteContext } from "../types.js";

export const registerListFamilies = (api: FastifyInstance, context: FamilyRouteContext): void => {
  api.get(
    "/families",
    withUser(context.currentUserId, async (_request, reply, userId) =>
      reply.send({ families: await listMyFamilies(context.pool, userId) }),
    ),
  );
};
