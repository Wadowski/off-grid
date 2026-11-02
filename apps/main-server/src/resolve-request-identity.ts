// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyRequest } from "fastify";
import { accessGroupIdSchema, familyIdSchema, userIdSchema } from "@offgrid/contracts";
import { listMyFamilies } from "@offgrid/family";
import { moduleDatabaseFor } from "./module-database-for.js";
import { requestIdentityFromBearer } from "./request-identity-from-bearer.js";
import { requireFamilyMembership } from "./require-family-membership.js";
import { anonymousContext } from "./anonymous-context.js";
import { ApiError } from "./api-error.js";
import { FAMILY_HEADER, INVALID_FAMILY_MESSAGE } from "./constants.js";
import type { RequestContext, ServerRuntime } from "./types.js";

export const resolveRequestIdentity = async (
  runtime: ServerRuntime,
  request: FastifyRequest,
): Promise<RequestContext> => {
  const bearerUserId = await requestIdentityFromBearer(request, runtime);
  if (bearerUserId === null) {
    return anonymousContext();
  }
  const userId = userIdSchema.parse(bearerUserId);
  const requestedFamily = request.headers[FAMILY_HEADER];
  if (requestedFamily === undefined) {
    return { userId, familyId: null, accessGroupIds: [] };
  }
  const parsedFamily = familyIdSchema.safeParse(requestedFamily);
  if (!parsedFamily.success) {
    throw new ApiError(400, "INVALID_FAMILY", INVALID_FAMILY_MESSAGE);
  }
  const familyId = parsedFamily.data;
  await requireFamilyMembership(
    moduleDatabaseFor(runtime, "family"),
    userId,
    familyId,
    listMyFamilies,
  );
  return { userId, familyId, accessGroupIds: [accessGroupIdSchema.parse(familyId)] };
};
