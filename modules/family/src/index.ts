// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import type { EventBus } from "@offgrid/event-bus";
import { createFamilyService } from "./application/family-service.js";
import { familySummarySubscription } from "./events/family-summary-projection.js";
import { registerFamilyRoutes } from "./http/family-routes.js";

export interface FamilyModuleContext {
  readonly pool: Pick<Pool, "connect">;
  readonly eventBus: EventBus;
  readonly currentUserId: (request: FastifyRequest) => string | null;
}

export const familyModule = {
  name: "family",
  migrations: [
    {
      schema: "family" as const,
      directory: fileURLToPath(new URL("./infrastructure/migrations", import.meta.url)),
    },
  ],
  registerRoutes(api: FastifyInstance, context: FamilyModuleContext): void {
    const service = createFamilyService(context.pool);
    registerFamilyRoutes(api, service, context.currentUserId);
  },
  registerSubscribers(context: FamilyModuleContext): void {
    context.eventBus.subscribe(familySummarySubscription);
  },
};
