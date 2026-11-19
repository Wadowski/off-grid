// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import Fastify, { type FastifyInstance } from "fastify";
import { createSystemModule } from "../src/index.js";
import { TEST_VERSION } from "./constants.js";
import type { SystemTestAppOptions } from "./types.js";

export const createSystemTestApp = async (
  db: ModuleDatabase,
  options: SystemTestAppOptions,
): Promise<FastifyInstance> => {
  const app = Fastify();
  const module = createSystemModule({ version: TEST_VERSION, updater: options.updater });
  await app.register(
    async (api) =>
      module.registerRoutes(api, {
        db,
        currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
        isInstanceAdmin: async (userId) => options.adminUserIds.includes(userId),
      }),
    { prefix: "/api" },
  );
  return app;
};
