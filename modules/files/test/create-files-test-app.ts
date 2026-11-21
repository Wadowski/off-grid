// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createInMemoryFileStorage } from "@offgrid/file-storage";
import Fastify, { type FastifyInstance } from "fastify";
import { registerFilesRoutes } from "../src/http/files/register-files-routes.js";
import { DEFAULT_TEST_MAX_UPLOAD_BYTES } from "./constants.js";
import type { FilesTestAppOptions, FilesTestDatabase } from "./types.js";

export const createFilesTestApp = async (
  db: FilesTestDatabase,
  options: FilesTestAppOptions = {},
): Promise<FastifyInstance> => {
  const app = Fastify();
  await app.register(async (api) =>
    registerFilesRoutes(api, {
      db: db.db,
      currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
      storage: options.storage ?? createInMemoryFileStorage(),
      maxUploadBytes: options.maxUploadBytes ?? DEFAULT_TEST_MAX_UPLOAD_BYTES,
    }),
  );
  return app;
};
