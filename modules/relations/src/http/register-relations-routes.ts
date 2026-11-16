// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { RelationsRouteContext } from "../types.js";
import { registerCrossEntityLinkRoutes } from "./cross-entity-links/register-cross-entity-link-routes.js";

export const registerRelationsRoutes = (
  api: FastifyInstance,
  context: RelationsRouteContext,
): void => {
  registerCrossEntityLinkRoutes(api, context);
};
