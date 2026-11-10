// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify, { type FastifyInstance } from "fastify";
import { registerFamilyRoutes } from "../src/http/register-family-routes.js";
import type { FamilyTestDatabase } from "./types.js";

export const createFamilyTestApp = async (db: FamilyTestDatabase): Promise<FastifyInstance> => {
  const app = Fastify();
  await app.register(async (api) =>
    registerFamilyRoutes(api, {
      db: db.db,
      currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
    }),
  );
  return app;
};
