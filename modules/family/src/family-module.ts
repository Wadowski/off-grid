// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";
import type { FastifyInstance } from "fastify";
import { familySummarySubscription } from "./events/family-summary-subscription.js";
import { registerFamilyRoutes } from "./http/family-routes.js";
import type { FamilyModuleContext } from "./types.js";

export const familyModule = {
  name: "family",
  migrations: [
    {
      schema: "family" as const,
      directory: fileURLToPath(new URL("./infrastructure/migrations", import.meta.url)),
    },
  ],
  registerRoutes: (api: FastifyInstance, context: FamilyModuleContext) =>
    registerFamilyRoutes(api, context),
  registerSubscribers: (context: FamilyModuleContext) => {
    context.eventBus.subscribe(familySummarySubscription);
  },
};
