// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createFamilyRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { createFamily } from "../application/create-family.js";
import type { FamilyRouteContext } from "../types.js";

export const registerCreateFamily = (api: FastifyInstance, context: FamilyRouteContext): void => {
  api.post(
    "/families",
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = createFamilyRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const family = await createFamily(context.db, userId, body.data.name);
      return reply.code(201).send(family);
    }),
  );
};
