// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createInMemoryFileStorage } from "@offgrid/file-storage";
import Fastify, { type FastifyInstance } from "fastify";
import { registerFilesRoutes } from "../src/http/files/register-files-routes.js";
import type { FilesTestDatabase } from "./types.js";

export const createFilesTestApp = async (db: FilesTestDatabase): Promise<FastifyInstance> => {
  const app = Fastify();
  await app.register(async (api) =>
    registerFilesRoutes(api, {
      db: db.db,
      currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
      storage: createInMemoryFileStorage(),
    }),
  );
  return app;
};
