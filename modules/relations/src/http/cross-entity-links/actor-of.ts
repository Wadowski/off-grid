// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyRequest } from "fastify";
import type { ActingContext, RelationsRouteContext } from "../../types.js";

export const actorOf = (
  context: RelationsRouteContext,
  request: FastifyRequest,
  userId: string,
): ActingContext => ({ userId, familyId: context.currentFamilyId(request) });
