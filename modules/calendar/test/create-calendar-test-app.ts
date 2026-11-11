// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify, { type FastifyInstance } from "fastify";
import { registerCalendarRoutes } from "../src/http/register-calendar-routes.js";
import type { CalendarTestDatabase } from "./types.js";

export const createCalendarTestApp = async (db: CalendarTestDatabase): Promise<FastifyInstance> => {
  const app = Fastify();
  await app.register(async (api) =>
    registerCalendarRoutes(api, {
      db: db.db,
      currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
    }),
  );
  return app;
};
