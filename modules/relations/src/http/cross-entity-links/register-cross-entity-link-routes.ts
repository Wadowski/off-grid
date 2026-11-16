// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { RelationsRouteContext } from "../../types.js";
import { registerCreateCrossEntityLink } from "./register-create-cross-entity-link.js";
import { registerListCrossEntityLinks } from "./register-list-cross-entity-links.js";
import { registerRemoveCrossEntityLink } from "./register-remove-cross-entity-link.js";

export const registerCrossEntityLinkRoutes = (
  api: FastifyInstance,
  context: RelationsRouteContext,
): void => {
  registerCreateCrossEntityLink(api, context);
  registerListCrossEntityLinks(api, context);
  registerRemoveCrossEntityLink(api, context);
};
